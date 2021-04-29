import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-serverlessfunction-group')
pulumi.export('ResourceGroup', resource_group.name)
