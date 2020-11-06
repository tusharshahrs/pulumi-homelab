"""An Azure RM Python Pulumi program"""
#import * as pulumi from "@pulumi/pulumi";
#import * as resource from "@pulumi/azure-nextgen/network/latest";


import pulumi
import pulumi_azure_nextgen.storage.latest as storage
import pulumi_azure_nextgen.resources.latest as resources
import pulumi_azure_nextgen.databricks.latest as databricks

from pulumi import export, ResourceOptions, Config, StackReference, get_stack, get_project

config = Config()
# reading in StackReference Path from local config
mystackpath = config.require("stackreference")
# setting the StackReference
mynetworkstackreference = StackReference(mystackpath)
my_secondvirtualnetwork = mynetworkstackreference.get_output("virtual_network_name")
my_remote_resourcegroup = mynetworkstackreference.get_output("resource_group_name")
#my_secondvirtualnetwork =  "shaht-vnet-for-peering"
my_remote_resourcegroup = "shaht-rg-for-peering"
# my subscription id
mysubid = config.get("mysubid")
# stackname for tags
stackName = get_stack()
# projectname for tags
projectName = get_project()

# local variables from config file
#   my subscription id
mysubid = config.get("mysubid")
#   azure location
my_location = config.get("location")
#   resource group name
my_resource_group_name = config.get("resource_group_name")
#   name
my_name = config.get("name")
# workspace name
myWorkspacename = "myWorkspace"
# 2nd virtual network.  Needed for peering.  This code assumes that the network below already exist before this pulumi code is run
#my_secondvirtualnetwork = "shahtdatabrickvnetpeerstuff"

#
my_peering_name="databricks_vnet_peering"
# collection of tags
basetags = {"cost-center": projectName, "stack":stackName, "env":"databricks","team":"engineering", "pulumi_cli":"yes", "cloud_location": my_location, "console_azure":"no"}

# Creating azure resources - start

# Create an Azure Resource Group
resource_group = resources.ResourceGroup(f"{my_name}-resourcegroup",
    resource_group_name = my_resource_group_name,
    location = my_location,
    tags=basetags,
    )

# Create an azure workspace
""" workspace = databricks.Workspace(f"{my_name}-workspace",
    location=my_location,
    resource_group_name=resource_group.name,
    workspace_name=myWorkspacename,
    parameters={
        "prepareEncryption": {
            "value": True,
        },
    },
    managed_resource_group_id=f"/subscriptions/{mysubid}/resourceGroups/{myWorkspacename}",
)

# setup vnet peering with another network on workspace
# If the peering status ever shows Disconnected, you will have to do the following:
# 1. commented out the v_net_peering block below
# 2. pulumi up -y --refresh
# 3. uncomment the commented out block below.
# 4. pulumi up -y --refresh
v_net_peering = databricks.VNetPeering(f"{my_name}-vNetPeering",
    allow_forwarded_traffic=True,
    allow_gateway_transit=False,
    allow_virtual_network_access=True,
    peering_name=my_peering_name,
    remote_virtual_network={
        #"id": f"/subscriptions/{mysubid}/resourceGroups/shaht-databrick-vnetpeer-rg/providers/Microsoft.Network/virtualNetworks/{mysecondvirtualnetwork}",
        "id": f"/subscriptions/{mysubid}/resourceGroups/{my_remote_resourcegroup}/providers/Microsoft.Network/virtualNetworks/{my_secondvirtualnetwork}",
    },
    resource_group_name=resource_group.name,
    use_remote_gateways=False,
    workspace_name=workspace.name)
 """
# Exporting outputs
pulumi.export("resource group name", resource_group.name)
pulumi.export("resource group location", resource_group.location)
""" pulumi.export("workspace name", workspace.name)
pulumi.export("workspace status", workspace.provisioning_state)
pulumi.export("workspace url", workspace.workspace_url)
pulumi.export("vnet peering provisioning_state", v_net_peering.provisioning_state)
pulumi.export("vnet peering peering_state", v_net_peering.peering_state)
pulumi.export("vnet peering name", v_net_peering.name)
pulumi.export("vnet peering remote_address_space", v_net_peering.remote_address_space)
pulumi.export("vnet peering urn", v_net_peering.urn)
 """