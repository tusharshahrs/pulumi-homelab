"""An Azure RM Python Pulumi program"""
#import * as pulumi from "@pulumi/pulumi";
#import * as resource from "@pulumi/azure-nextgen/network/latest";


import pulumi
import pulumi_azure_nextgen.storage.latest as storage
import pulumi_azure_nextgen.resources.latest as resources
from pulumi import export, ResourceOptions, Config, StackReference, get_stack, get_project

#from pulumi_azure_nextgen.storage import latest as storage
#from pulumi_azure_nextgen.resources import latest as resources
stackName = get_stack()
projectName = get_project()
mylocation = "eastus2"
basetags = {"cost-center": projectName, "stack":stackName, "env":"dev","team":"engineering", "demo":"yes", "cloud_location": mylocation}
# Create an Azure Resource Group
resource_group = resources.ResourceGroup("shahtrgdatabrick",
    resource_group_name = "shaht-databrick-rg",
    location = mylocation,
    tags=basetags,
    )

pulumi.export("resource group name", resource_group.name)