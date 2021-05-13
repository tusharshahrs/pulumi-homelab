import pulumi
from pulumi_azure_native import resources
from pulumi_azure_native import storage

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resourcegroup_functions_py')

# Create a Storage Account
account = storage.StorageAccount('storageaccount',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)
    
# Export the Azure Resource Group
pulumi.export('resourcegroup', resource_group.name)
# Export the Storage Account
pulumi.export('storageaccount', account.name)