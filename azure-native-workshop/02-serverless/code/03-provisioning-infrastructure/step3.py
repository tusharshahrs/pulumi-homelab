import pulumi
from pulumi_azure_native import resources
from pulumi_azure_native import storage
from pulumi_azure_native import web

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