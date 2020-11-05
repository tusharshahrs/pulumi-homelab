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
#mystackpath = config.require("stackreference")
# setting the StackReference
#mynetworkstackreference = StackReference(mystackpath)
#mysecondvirtualnetwork = mynetworkstackreference.get_output("virtual_network_name")
#my_remote_resourcegroup = mynetworkstackreference.get_output("resource_group_name")
mysecondvirtualnetwork =  "shaht-vnet-for-peering"
my_remote_resourcegroup = "shaht-rg-for-peering"
# my subscription id
mysubid = config.get("mysubid")
# stackname for tags
stackName = get_stack()
# projectname for tags
projectName = get_project()
# azure location
#mylocation = "eastus2"
mylocation = config.get("location")
# resource group name
myresourcegroupname = "shaht-databrick-rg"
# workspace name
myWorkspacename = "myWorkspace"
# 2nd virtual network.  Needed for peering.  This code assumes that the network below already exist before this pulumi code is run
#mysecondvirtualnetwork = "shahtdatabrickvnetpeerstuff"

#
my_peering_name="databricks_vnet_peering"
# collection of tags
basetags = {"cost-center": projectName, "stack":stackName, "env":"dev","team":"engineering", "demo":"yes", "cloud_location": mylocation}

# Creating azure resources - start

# Create an Azure Resource Group
resource_group = resources.ResourceGroup("shaht-databrick-resourcegroup",
    resource_group_name = myresourcegroupname,
    location = mylocation,
    tags=basetags,
    )

# Create an azure workspace
workspace = databricks.Workspace("shaht-databrick-workspace",
    location=mylocation,
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
v_net_peering = databricks.VNetPeering("vNetPeering",
    allow_forwarded_traffic=True,
    allow_gateway_transit=False,
    allow_virtual_network_access=True,
    peering_name=my_peering_name,
    remote_virtual_network={
        #"id": f"/subscriptions/{mysubid}/resourceGroups/shaht-databrick-vnetpeer-rg/providers/Microsoft.Network/virtualNetworks/{mysecondvirtualnetwork}",
        "id": f"/subscriptions/{mysubid}/resourceGroups/{my_remote_resourcegroup}/providers/Microsoft.Network/virtualNetworks/{mysecondvirtualnetwork}",
    },
    resource_group_name=resource_group.name,
    use_remote_gateways=False,
    workspace_name=workspace.name)

# Exporting outputs
pulumi.export("resource group name", resource_group.name)
pulumi.export("resource group location", resource_group.location)
pulumi.export("workspace name", workspace.name)
pulumi.export("workspace status", workspace.provisioning_state)
pulumi.export("workspace url", workspace.workspace_url)
pulumi.export("vnet peering provisioning_state", v_net_peering.provisioning_state)
pulumi.export("vnet peering peering_state", v_net_peering.peering_state)
pulumi.export("vnet peering name", v_net_peering.name)
pulumi.export("vnet peering remote_address_space", v_net_peering.remote_address_space)
pulumi.export("vnet peering urn", v_net_peering.urn)
