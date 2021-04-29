import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources
from pulumi_azure_native import web

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
     
pulumi.export('ResourceGroup', resource_group.name)
pulumi.export('AccountName', account.name)
pulumi.export('ConsumptionPlan', plan.name)