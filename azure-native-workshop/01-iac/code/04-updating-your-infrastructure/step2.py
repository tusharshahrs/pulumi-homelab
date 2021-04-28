import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-group')

# Create an Azure resource (Storage Account)
account = storage.StorageAccount('mystorage',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

pulumi.export('account_name', account.name)
