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

## Step 3 &mdash; Step 2 — Define a Consumption Plan
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

## Step 4 &mdash; Deploy Your Changes
We need to pass a Storage Account connection string to the settings of our future Function App. As this information is sensitive, Azure doesn't return it by default in the outputs of the Storage Account resource.

We need to make a separate invocation to the listStorageAccountKeys function to retrieve storage account keys. This invocation can only be run after the storage account is created. Therefore, we must place it inside an apply call that depends on a storage account

o1022350/utpu00t:441478



## Step 3 &mdash; Deploy Your Changes

Now that we've seen the full set of changes, let's deploy them. Select `yes`:

```
Updating (dev):

     Type                                     Name              Status      
 +   pulumi:pulumi:Stack                      iac-workshop-dev  created     
 +   └─ azure-native:resources:ResourceGroup  my-group          created     
 
Resources:

Resources:
    + 2 created

Duration: 8s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

Now your resource group has been created in your Azure account. Feel free to click the Permalink URL and explore; this will take you to the [Pulumi Console](https://www.pulumi.com/docs/intro/console/), which records your deployment history.

Note that Pulumi appends a suffix to the physical name of the resource group, e.g. `my-group1e56c2cf`. The difference between logical and physical names is due to "auto-naming" which Pulumi does to ensure side-by-side projects and zero-downtime upgrades work seamlessly. It can be disabled if you wish; [read more about auto-naming here](https://www.pulumi.com/docs/intro/concepts/programming-model/#autonaming).

## Next Steps

* [Updating Your Infrastructure](./04-updating-your-infrastructure.md)
