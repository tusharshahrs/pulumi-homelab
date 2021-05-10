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
    kind = "functionapp",
    reserved=True, # This is REQUIRED for PYTHON.  It can only run on Linux.
    sku=web.SkuDescriptionArgs(
        name="Y1",
        tier="Dynamic",
        size="Y1",
        family="Y",
        capacity=0
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
storageConnectionString = Output.concat("DefaultEndpointsProtocol=https;AccountName=",account.name,";AccountKey=",primaryStorageKey)
storageConnectionString2 = Output.concat("https://",account.name,".blob.core.windows.net/",primaryStorageKey)
#DefaultEndpointsProtocol=https;AccountName=storageaccountc5a3dfb0;AccountKey=G4bPiQH0KA4orLjfJt8wde2v3olMcSZjP1GNW4STNt1Kdpj6qQVpiWKaUvKsggpdFxWPsRrIusHuizi2i8RfZA==;EndpointSuffix=core.windows.net
storageConnectionString3 = Output.concat("DefaultEndpointsProtocol=https;AccountName=",account.name,";AccountKey=",primaryStorageKey,";EndpointSuffix=core.windows.net")

# Export the storageacountkey
pulumi.export("storageaccountkeys", (storageAccountKeys))

# Export the primarystoragekey
pulumi.export('primarystoragekey',  (primaryStorageKey )) 
# Export the storageconnectionstring
pulumi.export('storageconnectionstring', (storageConnectionString))
pulumi.export("storageconnectionstring2", (storageConnectionString2))
pulumi.export("storageconnectionstring3", (storageConnectionString3))


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
            web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/fix_python/content/lab/pulumi/azure-native/python/app/HelloWithPython.zip"),
            #web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/pulumi/examples/tree/2e9e18b36a9720dd0e691f2bfe883bbfd46bd512/azure-ts-functions-many/python/HelloPython")

            #web.NameValuePairArgs(name = "FUNCTIONS_WORKER_RUNTIME", value ="node"),
            #web.NameValuePairArgs(name = "runtime", value="node"),
            #web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/fix_python/content/lab/pulumi/azure-native/python/app"),
            #web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/fix_python/content/lab/pulumi/azure-native/typescript/app.zip"),

            ## Below works
            ##web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://mikhailworkshop.blob.core.windows.net/zips/app.zip")
            #web.NameValuePairArgs(name=  "WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/fix_python/content/lab/pulumi/azure-native/python/app.zip")
            #web.NameValuePairArgs(name="WEBSITE_RUN_FROM_PACKAGE", value="https://github.com/tusharshahrs/demo/raw/main/content/lab/pulumi/azure-native/python/app.zip")
        ],
    )
)

pulumi.export('function_app_name', app.name)
# Full  endpoint of your Function App
function_endpoint = app.default_host_name.apply(lambda default_host_name: f"https://{default_host_name}/api/hello")
pulumi.export('endpoint', function_endpoint)