import pulumi
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-resourcegroup')

# Export the Azure Resource Group
pulumi.export('myresourcegroup', resource_group.name)