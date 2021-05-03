import pulumi
from pulumi_azure_native import resources
from pulumi_azure_native import storage

config = pulumi.Config()

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-resourcegroup')

# Create an Azure resource (Storage Account)
account = storage.StorageAccount('storageaccount',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

container = storage.BlobContainer('blobcontainer',
                resource_group_name= resource_group.name,
                account_name= account.name,
                container_name=config.require('container'))

# Export the Azure Resource Group
pulumi.export('myresourcegroup', resource_group.name)
# Export the Storage Account
pulumi.export('storageaccountname', account.name)
# Export the BlobContainer
pulumi.export('blobcontainername', container.name)