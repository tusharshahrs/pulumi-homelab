import pulumi
from pulumi_azure_native import resources
from pulumi_azure_native import storage
from pulumi_azure_native import web
from pulumi import Output

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resourcegroup_functionapp')

# Create a Storage Account
account = storage.StorageAccount('storageaccount',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

# Create a consumption plan
plan = web.AppServicePlan("consumption-plan",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    sku=web.SkuDescriptionArgs(
        name="Y1",
        tier="Dynamic"
    )
)

# Export the Azure Resource Group
pulumi.export('resourcegroup', resource_group.name)
# Export the Storage Account
pulumi.export('storageaccount', account.name)
# Export the Consumption Plan
pulumi.export('consumptionplan', plan.name)


# List of storage account keys
storageAccountKeys = pulumi.Output.all(resource_group.name, account.name).apply(lambda args:  storage.list_storage_account_keys(resource_group_name=args[0],account_name=args[1]))
# Primary storage account key
primaryStorageKey = storageAccountKeys.apply(lambda accountKeys: accountKeys.keys[0].value)
# Build a storage connection string out of it:
storageConnectionString = Output.concat("DefaultEndpointsProtocol=https;AccountName=$",account.name,";AccountKey=",primaryStorageKey)

# Export the storageacountkey
pulumi.export("storageaccountkeys", storageAccountKeys)
# Export the primarystoragekey
pulumi.export('primarystoragekey',  primaryStorageKey ) 
# Export the storageconnectionstring
pulumi.export('storageconnectionstring', storageConnectionString)

# Create the functionapp
app = web.WebApp("functionapp", 
    resource_group_name=resource_group.name,
    location=resource_group.location,
    server_farm_id=plan.id,
    kind="functionapp",
        site_config=web.SiteConfigArgs(
        app_settings=[
            web.NameValuePairArgs(name = "FUNCTIONS_EXTENSION_VERSION", value="~3"),
            web.NameValuePairArgs(name = "FUNCTIONS_WORKER_RUNTIME", value ="python"),
            web.NameValuePairArgs(name = "AzureWebJobsStorage", value=storageConnectionString),
            web.NameValuePairArgs(name="WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/main/content/lab/pulumi/azure-native/python/app.zip")
        ]
    )
)