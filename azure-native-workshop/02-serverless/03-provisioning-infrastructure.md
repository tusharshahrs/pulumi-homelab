# Provisioning Infrastructure

Now that you have a project configured to use Azure, you'll create some basic infrastructure in it. We will start with a Resource Group.

## Step 1 &mdash; Declare a New Resource Group

Edit your `__main__.py` file, and leave only a new resource definition and required dependencies. Change the name of the resource group to 'my-serverlessfunction-group':

```python
import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-serverlessfunction-group')
pulumi.export('ResourceGroup', resource_group.name)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step1.py).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/1

     Type                                     Name                         Status      
 +   pulumi:pulumi:Stack                      azure-function-workshop-dev  created     
 +   └─ azure-native:resources:ResourceGroup  my-serverlessfunction-group  created     
 
Outputs:
    ResourceGroup: "my-serverlessfunction-group8edd9b0a"

Resources:
    + 2 created
```

## Step 2 &mdash; Add a Storage Account

And then add these lines to `__main__.py` right after creating the resource group.

```python
...
# Create a Storage Account.
# Azure Naming constraint for storage account: Storage account name must be between 3 and 24 characters in length and use numbers and lower-case letters only.
account = storage.StorageAccount('saserverless',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)
...
```

Add this line after the resource group export
```python
...
pulumi.export('AccountName', account.name)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step2.py).

Deploy the changes:

```
pulumi up
```
This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):


     Type                                    Name                         Status      
     pulumi:pulumi:Stack                     azure-function-workshop-dev              
 +   └─ azure-native:storage:StorageAccount  saserverless                 created     
 
Outputs:
  + AccountName  : "saserverlessf715dd5d"
    ResourceGroup: "my-serverlessfunction-group8edd9b0a"

Resources:
    + 1 created
    2 unchanged
```

## Step 3 &mdash; Define a Consumption Plan
There are several options to deploy Azure Functions. The serverless pay-per-execution hosting plan is called _Consumption Plan_.

There’s no resource named Consumption Plan, however. The resource name is inherited from Azure App Service: Consumption is one kind of an App Service Plan. It’s the SKU property of the resource that defines the type of hosting plan.

Here is a snippet that defines a Consumption Plan:

```python
...
from pulumi_azure_native import web

# Create a consumption plan
plan = web.AppServicePlan("appserviceplan",
    resource_group_name=resource_group.name,
    kind="app",
    name="consumption-plan",
    sku=web.SkuDescriptionArgs(
        name="Y1",
        family="Y1",
        tier="Dynamic"
    )
)

# Add the following after the storage account export
pulumi.export('ConsumptionPlan', plan.name)
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

View Live: https://app.pulumi.com/myuser/azure-function-workshop/dev/updates/8

     Type                                Name                         Status      
     pulumi:pulumi:Stack                 azure-function-workshop-dev              
 +   └─ azure-native:web:AppServicePlan  appserviceplan               created     
 
Outputs:
    AccountName    : "saserverlessf715dd5d"
  + ConsumptionPlan: "consumption-plan"
    ResourceGroup  : "my-serverlessfunction-group8edd9b0a"

Resources:
    + 1 created
    3 unchanged
```    

## Step 4 &mdash; Retrieve Storage Account Keys and Build Connection String

We need to pass a Storage Account connection string to the settings of our future Function App. As this information is sensitive, Azure doesn't return it by default in the outputs of the Storage Account resource.

We need to make a separate invocation to the listStorageAccountKeys function to retrieve storage account keys. This invocation can only be run after the storage account is created. Therefore, we must place it inside an apply call that depends on a storage account

```python
...
# Add this to the top of your code
from pulumi import Output

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

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step4.py).

Deploy the changes:

```
pulumi up
```
This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev)

View Live: https://app.pulumi.com/youruser/azure-function-workshop/dev/updates/17

     Type                 Name                         Status     
     pulumi:pulumi:Stack  azure-function-workshop-dev             
 
Outputs:
    AccountName    : "saserverlessf715dd5d"
    ConsumptionPlan: "consumption-plan"
    ResourceGroup  : "my-serverlessfunction-group8edd9b0a"

Resources:
    4 unchanged

Duration: 42s
```   

Notice, that no resources are created.  This is expected as we were creating the `storageConnectionString` for the next part
## Step 5 &mdash; Create a Function App

```python
...
app = web.WebApp("functionapp", 
    resource_group_name=resource_group.name,
    name="myfunctionapp123",  # This has to be unique across all of azure
    server_farm_id=plan.id,
    kind="functionapp",
    site_config=web.SiteConfigArgs(
        app_settings=[
            web.NameValuePairArgs(name = "AzureWebJobsStorage", value=storageConnectionString),
            web.NameValuePairArgs(name = "FUNCTIONS_EXTENSION_VERSION", value="~3"),
            web.NameValuePairArgs(name = "FUNCTIONS_WORKER_RUNTIME", value ="python"),
            web.NameValuePairArgs(name="WEBSITE_RUN_FROM_PACKAGE", value="REPLACE_ME_WITH_REAL_URL_FIX_PENDING")
            ]
        )
    )
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step5.py).

## Step 6 &mdash; Export the Function App endpoint

Finally, declare a stack output called endpoint to export the URL of the Azure Function using the defaultHostName.
Now, if you inspect the type of the app.defaultHostname, you will see that it's `pulumi.Output<string>` not just `string`. That’s because Pulumi runs your program before it creates any infrastructure, and it wouldn’t be able to put an actual string into the variable. You can think of `Output<T>` as similar to `Promise<T>`, although they are not the same thing.

You want to export the full endpoint of your Function App.  Add this to the end of your code.

```python
...
function_endpoint = app.default_host_name.apply(lambda default_host_name: f"https://{default_host_name}/hello")
pulumi.export('endpoint', function_endpoint)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step6.py).

## Step 7 &mdash; Provision the Function App

Deploy the program to stand up your Azure Function App:

```
pulumi up
```
This will output the status and resulting public URL:

```
REPLACE
```

You can now open the resulting endpoint in the browser or curl it:

```bash
curl $(pulumi stack output endpoint)
```


## Step 8 &mdash; Destroy Everything

```
pulumi destroy
```
This will give you a preview and selecting `yes` will apply the changes:

Remove the stack
```
pulumi stack rm
```


* [Home](../#azure-native-workshop-with-pulumi)
