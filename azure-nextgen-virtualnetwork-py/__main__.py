"""An Azure RM Python Pulumi program"""

import pulumi
from pulumi_azure_nextgen.storage import latest as storage
from pulumi_azure_nextgen.resources import latest as resources
from pulumi_azure_nextgen.network import latest as network
from pulumi import export, ResourceOptions, Config, StackReference, get_stack, get_project


config = Config()
my_location = config.get("location")
my_resource_group_name = config.get("resource_group_name")#"shaht-vnet-rg"
my_network_name=config.get("network_name")
my_cidr_block = config.get("virtual_network_cidr")
my_subnet_1_cidr = config.get("subnet_1_cidr")
my_subnet_2_cidr = config.get("subnet_2_cidr")
projectName = get_project()
stackName = get_stack()

mytags = {"stack":stackName,"project":projectName,"created_by":"johnsmith","launched_via":"pulumi"}

# Create an Azure Resource Group
# https://www.pulumi.com/docs/reference/pkg/azure-nextgen/resources/resourcegroup/
resource_group = resources.ResourceGroup('resource_group',
    resource_group_name=my_resource_group_name,
    location=my_location,
    tags=mytags,
    )

# Create a virtual network
# https://www.pulumi.com/docs/reference/pkg/azure-nextgen/network/virtualnetwork/
virtual_network = network.VirtualNetwork("virtualNetwork",
    address_space={
        "addressPrefixes": [my_cidr_block],
    },
    location=resource_group.location,
    resource_group_name=resource_group.name,
    virtual_network_name=my_network_name,
    tags=mytags)

subnet1 = network.Subnet(f"{my_network_name}-subnet1",
    resource_group_name=resource_group.name,
    virtual_network_name=virtual_network.name,
    subnet_name=f"{my_network_name}-subnet1",
    address_prefix=my_subnet_1_cidr,
    )

subnet2 = network.Subnet(f"{my_network_name}-subnet2",
    resource_group_name=resource_group.name,
    virtual_network_name=virtual_network.name,
    subnet_name=f"{my_network_name}-subnet2",
    address_prefix=my_subnet_2_cidr,
    )

pulumi.export("resource_group_name", resource_group.name)
pulumi.export("azure region", resource_group.location)
pulumi.export("virtual_network_name", virtual_network.name)
pulumi.export("virtual_network_cidr_block", virtual_network.address_space)
pulumi.export("virtual_network_subnet1_cidr_name", subnet1.name)
pulumi.export("virtual_network_subnet1_cidr_block", subnet1.address_prefix)
pulumi.export("virtual_network_subnet2_cidr_name", subnet2.name)
pulumi.export("virtual_network_subnet2_cidr_block", subnet2.address_prefix)