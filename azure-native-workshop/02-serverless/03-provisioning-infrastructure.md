# Provisioning Infrastructure

Now that you have a project configured to use Azure, you'll create some basic infrastructure in it. We will start with a Resource Group.

## Step 1 &mdash; Declare a New Resource Group and export it

Edit your `__main__.py` file, and leave only a new resource definition and required dependencies. Change the name of the resource group to 'my-resourcegroup'. Programs can export variables which will be shown in the CLI and recorded for each deployment.  We will add a pulumi.export code.

```python
import pulumi
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resourcegroup_functions_py')

# Export the Azure Resource Group
pulumi.export('resourcegroup', resource_group.name)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step1.py).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev)

View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/3

     Type                                     Name                         Status      
 +   pulumi:pulumi:Stack                      azure-py-functions-dev      created     
 +   └─ azure-native:resources:ResourceGroup  resourcegroup_functions_py  created  
 
Outputs:
    resourcegroup: "resourcegroup_functions_py925e474c"

Resources:
    + 2 created

Duration: 5s
```

## Step 2 &mdash; Add a Storage Account

Add this line to the `__main__.py` right after the `import resources` at the top

```python
...
from pulumi_azure_native import storage
...
```

And then add these lines to `__main__.py` right after creating the resource group:

```python
...
# Create an Azure resource (Storage Account)
account = storage.StorageAccount('storageaccount',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)
...
```

Add this line after the resource group export
```python
...
pulumi.export('storageaccount', account.name)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step2.py).

Deploy the changes:

```
pulumi up
```
This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev)

View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/4

     Type                                    Name                    Status      
     pulumi:pulumi:Stack                     azure-py-functions-dev              
 +   └─ azure-native:storage:StorageAccount  storageaccount          created     
 
Outputs:
    resourcegroup : "resourcegroup_functions_py925e474c"
  + storageaccount: "storageaccounte925e820"

Resources:
    + 1 created
    2 unchanged

Duration: 24s
```

## Step 3 &mdash; Define a Consumption Plan
There are several options to deploy Azure Functions. The serverless pay-per-execution hosting plan is called _Consumption Plan_.

There’s no resource named Consumption Plan, however. The resource name is inherited from Azure App Service: Consumption is one kind of an App Service Plan. It’s the SKU property of the resource that defines the type of hosting plan.

Here is a snippet that defines a Consumption Plan:

Add this line to the `__main__.py` right after the `import resources` at the top

```python
...
from pulumi_azure_native import web
```

And then add these lines to `__main__.py` right after creating the storage account resource:

```python
...
# Create a consumption plan
# Consumption plan must be linux for python: https://docs.microsoft.com/en-us/azure/azure-functions/functions-scale#operating-systemruntime
plan = web.AppServicePlan("consumption-plan",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    kind = "functionapp",
    reserved=True, # This is an Azure Requirement for PYTHON. The function can only run on Linux. 
    sku=web.SkuDescriptionArgs(
        name="Y1",
        tier="Dynamic",
        size="Y1",
        family="Y",
        capacity=0
    )
)

# Add the following after the storage account export
pulumi.export('consumptionplan', plan.name)
...
```

Note the specific way that the property `sku` is configured. If you ever want to deploy to another type of a service plan, you would need to change these values accordingly.

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step3.py).

Deploy the changes:

```
pulumi up
```
This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev)

View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/45

     pulumi:pulumi:Stack                 azure-py-functions-dev              
 +   └─ azure-native:web:AppServicePlan  consumption-plan        created     
 
Outputs:
  + consumptionplan: "consumption-planbb670fa1"
    resourcegroup  : "resourcegroup_functions_py925e474c"
    storageaccount : "storageaccounte925e820"

Resources:
    + 1 created
    3 unchanged

Duration: 8s
```    

## Step 4 &mdash; Retrieve Storage Account Keys and Build Connection String

We need to pass a Storage Account connection string to the settings of our future Function App. As this information is sensitive, Azure doesn't return it by default in the outputs of the Storage Account resource.

We need to make a separate invocation to the listStorageAccountKeys function to retrieve storage account keys. This invocation can only be run after the storage account is created. Therefore, we must place it inside an [apply](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#apply) call that depends on a storage account.  We will also be using [all](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#all) since we need to use an `apply` over many resources.

Add this line to the `__main__.py` right after the `import web` at the top

```python
...
from pulumi import Output
...
```

Add this line to the `__main__.py` right after the `consumption plan resource`

```python
...
# List of storage account keys
storageAccountKeys = pulumi.Output.all(resource_group.name, account.name).apply(lambda args:  storage.list_storage_account_keys(resource_group_name=args[0],account_name=args[1]))
...
```

Extract the first key.  Add this after the storageAccountKeys

```python
...
# Primary storage account key
primaryStorageKey = storageAccountKeys.apply(lambda accountKeys: accountKeys.keys[0].value)
...
```

Build a connection string out of it.  Add this after the primaryStorageKey

```python
...
# Build a connection string out of it:
storageConnectionString = Output.concat("DefaultEndpointsProtocol=https;AccountName=$",account.name,";AccountKey=",primaryStorageKey )
...
```

The connection keys are sensitive data so we want to protect them as secrets.
Pulumi allows you to [programmatically create secrets](https://www.pulumi.com/docs/intro/concepts/secrets/#programmatically-creating-secrets).  We will be calling [Output.secret](https://www.pulumi.com/docs/reference/pkg/python/pulumi/#pulumi.Output.secret) to construct a secret from an existing value.

And then add these lines to `__main__.py` right after creating the consumption plan export
```python
...
# Export the storageacountkey as a secret
pulumi.export("storageaccountkeys", pulumi.Output.secret(storageAccountKeys))
# Export the primarystoragekey as a secret
pulumi.export('primarystoragekey',  pulumi.Output.secret(primaryStorageKey )) 
# Export the storageconnectionstring  as a secret
pulumi.export('storageconnectionstring', pulumi.Output.secret(storageConnectionString))
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step4.py).

Deploy the changes:

```
pulumi up
```
This will give you a preview and selecting `yes` will apply the changes:

```
View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/46

     Type                 Name                    Status     
     pulumi:pulumi:Stack  azure-py-functions-dev             
 
Outputs:
    consumptionplan        : "consumption-planbb670fa1"
  + primarystoragekey      : "[secret]"
    resourcegroup          : "resourcegroup_functions_py925e474c"
    storageaccount         : "storageaccounte925e820"
  + storageaccountkeys     : "[secret]"
  + storageconnectionstring: "[secret]"

Resources:
    4 unchanged

Duration: 7s
```   

Notice that no resources are created.  This is expected as we were adding outputs. The keys and the connection strings are marked as **secret**.  To view them via the cli, run:  [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/) ```--show-secrets```

## Step 5 &mdash; Create a Function App

And then add these lines to `__main__.py` right after creating the storageconnectionstring `export`

```python
...
# Create the functionapp
app = web.WebApp("functionapp", 
    resource_group_name=resource_group.name,
    location=resource_group.location,
    kind="functionapp",
    reserved=True,
    server_farm_id=plan.id,
        site_config=web.SiteConfigArgs(
        app_settings=[
            web.NameValuePairArgs(name = "runtime", value="python"),
            web.NameValuePairArgs(name = "FUNCTIONS_WORKER_RUNTIME", value ="python"),
            web.NameValuePairArgs(name = "FUNCTIONS_EXTENSION_VERSION", value="~3"),
            web.NameValuePairArgs(name = "AzureWebJobsStorage", value=storageConnectionString),
            web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/main/content/lab/pulumi/azure-native/python/app/HelloWithPython.zip"),
        ],
    )
)
...
```

**Azure Python Function Zip file** - 
   The applications settings configure the app to run on Python3 deploy the specified zip file to the Function App. The app will download the specified file, extract the code from it, discover the functions, and run them. We’ve prepared this [zip](https://github.com/tusharshahrs/demo/blob/main/content/lab/pulumi/azure-native/python/app/HelloWithPython.zip) file for you to get started faster, you can find its code [here](https://github.com/tusharshahrs/demo/tree/main/content/lab/pulumi/azure-native/python/app). The code contains a single HTTP-triggered Azure Function.

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step5.py).

## Step 6 &mdash; Export the Function App endpoint

Finally, declare a stack output called endpoint to export the URL of the Azure Function using the defaultHostName.
Now, if you inspect the type of the app.defaultHostname, you will see that it's `pulumi.Output<string>` not just `string`. That’s because Pulumi runs your program before it creates any infrastructure, and it wouldn’t be able to put an actual string into the variable. You can think of `Output<T>` as similar to `Promise<T>`, although they are not the same thing. A quick aside here, for those not familiar with what <T> is. <T> is a mechanism for denoting that the value is known at some point in the future. It comes from [Generic Programming](https://en.wikipedia.org/wiki/Generic_programming) and is really useful in situations like this, when we (ie, us running our Pulumi programs) are waiting for the value to be returned from our cloud providers API.  You want to export the full endpoint of your Function App.  Add this to the end of your code after the functionapp called `app`

```python
...
# Export the function
pulumi.export('function_app', app.name)
# Full  endpoint of your Function App
function_endpoint = app.default_host_name.apply(lambda default_host_name: f"https://{default_host_name}/api/HelloWithPython")
pulumi.export('endpoint', function_endpoint)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step6.py).

## Step 7 &mdash; Provision the Function App

Deploy the program to stand up your Azure Function App:

```
pulumi up

     Type                        Name                    Status      
     pulumi:pulumi:Stack         azure-py-functions-dev              
 +   └─ azure-native:web:WebApp  functionapp             created     
 
Outputs:
    consumptionplan        : "consumption-planbb670fa1"
  + endpoint               : "https://functionappa6fe3701.azurewebsites.net/api/HelloWithPython"
  + function_app           : "functionappa6fe3701"
    primarystoragekey      : "[secret]"
    resourcegroup          : "resourcegroup_functions_py925e474c"
    storageaccount         : "storageaccounte925e820"
    storageaccountkeys     : "[secret]"
    storageconnectionstring: "[secret]"

Resources:
    + 1 created
    4 unchanged

Duration: 25s
```

You can now view the stack output via [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/):

```bash
pulumi stack output endpoint
```

You will get the following:

```
https://functionappa6fe3701.azurewebsites.net/api/HelloWithPython
```

You can now open the resulting endpoint in the browser or curl it:

```bash
curl $(pulumi stack output endpoint)
```
And you'll see a the following message:

```
Hello from Python in Pulumi! You have stood up a serverless function in Azure!
```

## Step 8 &mdash; Destroy Everything

```
pulumi destroy
```
This will give you a preview and selecting `yes` will apply the changes:

Remove the stack
```
pulumi stack rm
This will permanently remove the 'dev' stack!
Please confirm that this is what you'd like to do by typing ("dev"):
```

You must enter the stack name:  `dev`

* [Home](../#azure-native-workshop-with-pulumi)
