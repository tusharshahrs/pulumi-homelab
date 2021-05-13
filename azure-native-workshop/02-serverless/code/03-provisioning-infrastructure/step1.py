import pulumi
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resourcegroup_functions_py')

# Export the Azure Resource Group
pulumi.export('resourcegroup', resource_group.name)
