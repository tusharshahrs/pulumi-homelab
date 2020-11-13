"""An Azure RM Python Pulumi program"""
import pulumi
import pulumi_azure_nextgen.resources.latest as resources
import pulumi_azure_nextgen.databricks.latest as databricks

from pulumi import Output, export, Config, StackReference, get_stack, get_project

config = Config()
# reading in StackReference Path from local config
mystackpath = config.require("stackreference")
# setting the StackReference
my_network_stackreference = StackReference(mystackpath)
my_secondvirtualnetwork_output = my_network_stackreference.get_output("virtual_network_name")
my_remote_resourcegroup_output = my_network_stackreference.get_output("resource_group_name")
#my_secondvirtualnetwork = my_secondvirtualnetwork_output.apply(lambda my_secondvirtualnetwork_output: f"{my_secondvirtualnetwork_output}")
#my_remote_resourcegroup = my_remote_resourcegroup_output.apply(lambda my_remote_resourcegroup_output: f"{my_remote_resourcegroup_output}")

# The values for my_secondvirtualnetwork & my_remote_resourcegroup are from the virtualnetwork that has
# already been created using another pulumi stack.  This has to exist before this code can run.
my_secondvirtualnetwork =  "shaht-vnet-peering-to-databricks" # 2nd virtual network.  Needed for vpn peering block FROM databricks.
my_remote_resourcegroup = "shaht-rg-peering-to-databricks"

# local variables from config file
#   my subscription id
mysubid = config.get("mysubid")
#   azure location
my_location = config.get("location")
#   resource group name
my_resource_group_name = config.get("resource_group_name")
#   name
my_name = config.get("name")
#   workspace name
my_Workspacename = config.get("workspacename")

# Databricks vpn peering name.
my_peering_name="databricks_peering"

# Creating Tags
# stackname for tags
stackName = get_stack()
# projectname for tags
projectName = get_project()

# collection of tags
basetags = {"cost-center": projectName, "stack":stackName, "env":"databricks","team":"engineering", "pulumi_cli":"yes", "cloud_location": my_location, "console_azure":"no"}

#
# Azure Resource creating starting here.
#
 
# Create an azure resource group
resource_group = resources.ResourceGroup(f"{my_name}-resourcegroup",
    resource_group_name = my_resource_group_name,
    location = my_location,
    tags=basetags,
    )

# Create an azure workspace
workspace = databricks.Workspace(f"{my_name}-workspace",
    location=my_location,
    resource_group_name=resource_group.name,
    workspace_name=my_Workspacename,
    parameters={
        "prepareEncryption": {
            "value": True,
        },
    },
    managed_resource_group_id=f"/subscriptions/{mysubid}/resourceGroups/{my_Workspacename}",
)

# setup vnet peering with another network on workspace
# If the peering status ever shows Disconnected, you will have to do the following:
# 1. commented out the v_net_peering block below
# 2. pulumi up -y --refresh
# 3. uncomment the commented out block below.
# 4. pulumi up -y --refresh

# setup v_net_peering FROM databricks workspace to 2nd virtual network
v_net_peering = databricks.VNetPeering(f"{my_name}-vNetPeering",
    allow_forwarded_traffic=True,
    allow_gateway_transit=False,
    allow_virtual_network_access=True,
    peering_name=my_peering_name,
    remote_virtual_network={
        "id": f"/subscriptions/{mysubid}/resourceGroups/{my_remote_resourcegroup}/providers/Microsoft.Network/virtualNetworks/{my_secondvirtualnetwork}",
        #"id": f"/subscriptions/{mysubid}/resourceGroups/{my_remote_resourcegroup}/providers/Microsoft.Network/virtualNetworks/{my_secondvirtualnetwork}",
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