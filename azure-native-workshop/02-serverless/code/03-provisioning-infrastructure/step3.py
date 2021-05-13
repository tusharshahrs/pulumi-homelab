import pulumi
from pulumi_azure_native import resources
from pulumi_azure_native import storage
from pulumi_azure_native import web

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resourcegroup_functions_py')

# Create a Storage Account
account = storage.StorageAccount('storageaccount',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS,),
    kind=storage.Kind.STORAGE_V2)

# Create a consumption plan
# Consumption plan must be linux for python: https://docs.microsoft.com/en-us/azure/azure-functions/functions-scale#operating-systemruntime
plan = web.AppServicePlan("consumption-plan",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    kind = "functionapp",
    reserved=True, # This is an Azure Requirement for PYTHON. The function can only run on Linux. 
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