# Updating Your Infrastructure

We just saw how to create new infrastructure from scratch. Next, let's add an Azure Storage Account to the existing resource group.

This demonstrates how declarative infrastructure as code tools can be used not just for initial provisioning, but also subsequent changes to existing resources.

## Step 1 &mdash; Add a Storage Account

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
account = storage.StorageAccount('mystorage',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/04-updating-your-infrastructure/step1.py).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev)

View Live: https://app.pulumi.com/myuser/iac-workshop/dev/updates/14

     Type                                    Name              Status      
     pulumi:pulumi:Stack                     iac-workshop-dev              
 +   └─ azure-native:storage:StorageAccount  storageaccount    created     
 
Outputs:
    myresourcegroup: "my-resourcegroup32b80185"

Resources:
    + 1 created
    2 unchanged

Duration: 4s

```

A single resource is added and the 2 existing resources are left unchanged. This is a key attribute of infrastructure as code &mdash; such tools determine the minimal set of changes necessary to update your infrastructure from one version to the next.

## Step 2 &mdash; Export Your New Storage Account Name

To inspect your new storage account, you will need its physical Azure name. Pulumi records a logical name, `mystorage`, however the resulting Azure name will be different.

Programs can export variables which will be shown in the CLI and recorded for each deployment. Export your account's name by adding an export statement to `__main__.py` after the resource group export:

```python
# Export the Storage Account
pulumi.export('StorageAccountName', account.name)
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/04-updating-your-infrastructure/step2.py).

Now deploy the changes:

```bash
pulumi up
```

Notice a new `Outputs` section is included in the output containing the account's name:

```
...

Outputs:
    myresourcegroup   : "my-resourcegroup32b80185"
  + storageaccountname: "storageaccounta86f2840"

Resources:
    3 unchanged

Duration: 37s

View Live: : https://app.pulumi.com/myuser/iac-workshop/dev/updates/3
```

Azure requires each storage account to have a globally unique names across all tenants. As we already learned, Pulumi generated a longer physical name for the Storage Account. Autonaming is very handy in our case: Each Storage Account receives a subdomain of `*.core.windows.net`, therefore the name has to be globally unique across all Azure subscriptions worldwide. Instead of inventing such a name, we can trust Pulumi to generate one.  This is a good example of when a logical resource name may differ from a physical name.

Also, we haven’t defined an explicit location for the Storage Account. By default, Pulumi inherits the location from the Resource Group. You can always override it with the `Location` property if needed.

## Step 3 &mdash; Inspect Your New Storage Account

Now run the `az` CLI to list the containers in this new account:

```
az storage container list --account-name $(pulumi stack output storageaccountname)
[]
```

Note that the account is currently empty.

## Step 4 &mdash; Add a Container to Your Storage Account

Add these lines to `__main__.py` right after creating the storage account itself:

```python
...
container = storage.BlobContainer('blobcontainer',
                resource_group_name= resource_group.name,
                account_name= account.name,
                container_name="files")
...
```

Export the Blobcontainer's name by adding this after the storage account export
```python
...
# Export the BlobContainer
pulumi.export('blobcontainername', container.name)
...
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/04-updating-your-infrastructure/step4.py).

Note that I want to give an explicit name to the storage container instead of an auto-generated one, so I used the property `name` to set it.

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
View Live: https://app.pulumi.com/myuser/iac-workshop/dev/updates/6

     Type                                   Name              Status      
     pulumi:pulumi:Stack                    iac-workshop-dev              
 +   └─ azure-native:storage:BlobContainer  blobcontainer     created     
 
Outputs:
  + blobcontainername : "files"
    myresourcegroup   : "my-resourcegroup32b80185"
    storageaccountname: "storageaccounta86f2840"

Resources:
    + 1 created
    3 unchanged

Duration: 29s

Finally, relist the contents of your account:

```bash
az storage container list --account-name $(pulumi stack output storageaccountname) -o table
Name    Lease Status    Last Modified
------  --------------  -------------------------
files   unlocked        2021-04-30T20:23:48+00:00
```

Notice that your `files` container has been added.

## Next Steps

* [Making Your Stack Configurable](./05-making-your-stack-configurable.md)
