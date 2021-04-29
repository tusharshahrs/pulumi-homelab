import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-serverlessfunction-group')

# Create a Storage Account
account = storage.StorageAccount('saserverless',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

pulumi.export('ResourceGroup', resource_group.name)
pulumi.export('AccountName', account.name)