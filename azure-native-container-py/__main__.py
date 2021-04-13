"""An Azure Python Pulumi program"""

import pulumi
from pulumi_azure import core, storage, network
import pulumi_azure_native as azure_native
# comment
name = "demo"
mylocation = "centralus"
# Create an Azure Resource Group
myresourcegroup = core.ResourceGroup(f"{name}-resource_group", location=mylocation)

mynetwork = network.VirtualNetwork(f"{name}-vnet",
    resource_group_name=myresourcegroup.name,
    location=myresourcegroup.location,
    address_spaces=["10.0.0.0/16"],
)

mysubnet1 = network.Subnet(f"{name}-subnet1",
    resource_group_name=myresourcegroup.name,
    virtual_network_name=mynetwork.name,
    address_prefixes=["10.0.1.0/24"],
    delegations=[network.SubnetDelegationArgs(
        name=f"{name}-subnet1-delegation",
        service_delegation=network.SubnetDelegationServiceDelegationArgs(
            name="Microsoft.ContainerInstance/containerGroups",
            actions=["Microsoft.Network/virtualNetworks/subnets/action"],
        ),
    )]
    )

mynetworkprofile = network.Profile(f"{name}-aciprofile",
    resource_group_name=myresourcegroup.name,
    location=myresourcegroup.location,
    container_network_interface=network.ProfileContainerNetworkInterfaceArgs(
        name=f"{name}-aci-nic",
        ip_configurations=[{
            "name": "aci-network-interface",
            "subnet_id": mysubnet1.id,
        }],
    ))

image = "nginx"
DEFAULT_CPU_COUNT = 1
DEFAULT_MEMORY_IN_GB = 1.5
cpu = DEFAULT_CPU_COUNT
memory = DEFAULT_MEMORY_IN_GB

container_resource_requests = azure_native.containerinstance.ResourceRequestsArgs(cpu=cpu, memory_in_gb=memory)

containers=[azure_native.containerinstance.ContainerArgs(
        command=[],
        environment_variables=[],
        image="nginx:latest",
        name=f"{name}-container",
        ports=[azure_native.containerinstance.ContainerPortArgs(
            port=80,
        )],
        resources=azure_native.containerinstance.ResourceRequirementsArgs(
            requests=container_resource_requests)
)]


network_profile = azure_native.containerinstance.ContainerGroupNetworkProfileArgs(id=mynetworkprofile.id)

container_group = azure_native.containerinstance.ContainerGroup(f"{name}-containergroup",
            container_group_name=f"{name}-containergroup",
            containers=containers,
            os_type="Linux",
            resource_group_name=myresourcegroup.name,
            location=mylocation,
            network_profile=network_profile,
            restart_policy="Always",
            ip_address=azure_native.containerinstance.IpAddressArgs(
                ports=[azure_native.containerinstance.PortArgs(
                    port=80,
                    protocol="TCP",
                )],
                type="Private"
            )
)

pulumi.export('resource_group_name', myresourcegroup.name)
pulumi.export('vnet', mynetwork.name)
pulumi.export('subnet1', mysubnet1.name)
pulumi.export('profile', mynetworkprofile.name)
pulumi.export('containergroup', container_group.name)
pulumi.export('containergroup_provisioning_state', container_group.provisioning_state)

