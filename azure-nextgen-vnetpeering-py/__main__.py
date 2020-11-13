"""An Azure RM Python Pulumi program"""

import pulumi
import pulumi_azure_nextgen.network.latest as network
from pulumi import Config, StackReference

# read local config settings - network
config = Config()

# reading in StackReference Path from local config
mystackpath = config.require("stackreference")
# setting the StackReference
mynetworkstackreference = StackReference(mystackpath)
# get azure subscription id
my_subid = config.get("subid")

# getting the resource group that where the current virtualnetwork ( the one that doesn't have databricks) is.
my_resource_group = mynetworkstackreference.get_output("resource_group_name")

# getting the virutal network that where the current virtualnetwork ( the one that doesn't have databricks) is.
my_virtual_network_name = mynetworkstackreference.get_output("virtual_network_name")

# Databricks resource group
my_remote_resource_group = "myWorkspace"
# Databricks virtual network
my_remote_virtual_network = "workers-vnet"
# vnet peering name FROM the virtualnetwork TO the databricks virtualnetwork
my_virtual_network_peering_name = "shaht-vnet-peering-back-to-databricks"

# vnet peering resource
v_net_peering = network.VirtualNetworkPeering("virtualNetworkPeering",
    allow_forwarded_traffic=True,
    allow_gateway_transit=False,
    allow_virtual_network_access=True,
    remote_virtual_network={
        "id": f"/subscriptions/{my_subid}/resourceGroups/{my_remote_resource_group}/providers/Microsoft.Network/virtualNetworks/{my_remote_virtual_network}",
    },
    resource_group_name=my_resource_group,
    use_remote_gateways=False,
    virtual_network_name=my_virtual_network_name,
    virtual_network_peering_name=my_virtual_network_peering_name)

pulumi.export("vnet peering provisioning_state", v_net_peering.provisioning_state)
pulumi.export("vnet peering peering_state", v_net_peering.peering_state)
pulumi.export("vnet peering name", v_net_peering.name)
pulumi.export("vnet peering remote_address_space", v_net_peering.remote_address_space)
pulumi.export("vnet peering urn", v_net_peering.urn)