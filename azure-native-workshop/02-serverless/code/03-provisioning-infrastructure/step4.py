import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources
from pulumi_azure_native import web
from pulumi import Output

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-serverlessfunction-group')

# Create a Storage Account
account = storage.StorageAccount('saserverless',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

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

# List of storage account keys
storageAccountKeys = pulumi.Output.all(resource_group.name, account.name).apply(lambda args:  storage.list_storage_account_keys(resource_group_name=args[0],account_name=args[1]))
# Primary storage account key
primaryStorageKey = storageAccountKeys.apply(lambda accountKeys: accountKeys.keys[0].value)
# Build a storage connection string out of it:
storageConnectionString = Output.concat("DefaultEndpointsProtocol=https;AccountName=$",account.name,";AccountKey=",primaryStorageKey )

pulumi.export('ResourceGroup', resource_group.name)
pulumi.export('AccountName', account.name)
pulumi.export('ConsumptionPlan', plan.name)
pulumi.export("StorageAccountKeys", storageAccountKeys)
pulumi.export('PrimaryStorageKey',primaryStorageKey ) 
pulumi.export('StorageConnectionString', storageConnectionString)