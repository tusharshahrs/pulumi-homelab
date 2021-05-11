import base64

import pulumi
from pulumi.resource import ResourceOptions
from pulumi_azure_native import resources, containerservice, network
from pulumi_azure_native.network import virtual_network
import pulumi_azuread as azuread
import pulumi_random as random
import pulumi_tls as tls

config = pulumi.Config()

name="shaht"

# Create new resource group
resource_group = resources.ResourceGroup(f'{name}-azure-native-py-aks')

# Create an AD service principal
ad_app = azuread.Application(f'{name}-aks-app', display_name=f'{name}-aks-app')
ad_sp = azuread.ServicePrincipal(f'{name}-aksSp', application_id=ad_app.application_id)

# Generate random password
password = random.RandomPassword(f'{name}-password', length=20, special=True)

# Create the Service Principal Password
ad_sp_password = azuread.ServicePrincipalPassword(f'{name}-aksSpPassword',
                                                  service_principal_id=ad_sp.id,
                                                  value=password.result,
                                                  end_date="2099-01-01T00:00:00Z")

# Generate an SSH key
ssh_key = tls.PrivateKey(f'{name}-ssh-key', algorithm="RSA", rsa_bits=4096)


# Create cluster
managed_cluster_name = config.get("managedClusterName")
if managed_cluster_name is None:
    managed_cluster_name = f'{name}-azure-native-aks'

# Create network
mynetwork = network.VirtualNetwork(f'{name}-vnet', 
            resource_group_name=resource_group.name,
            location=resource_group.location,
            address_space=network.AddressSpaceArgs(
                address_prefixes=["10.0.0.0/20"],
            ),
            #opts=ResourceOptions(ignore_changes=["subnet1", "subnet2"])
)

subnet1 = network.Subnet(f'{name}-subnet-1',
            resource_group_name = resource_group.name,
            virtual_network_name = mynetwork.name,
            address_prefix="10.0.0.0/21",
            opts=ResourceOptions(parent=mynetwork)
)

subnet2 = network.Subnet(f'{name}-subnet-2',
            resource_group_name = resource_group.name,
            virtual_network_name = mynetwork.name,
            address_prefix= "10.0.8.0/21",
            opts=ResourceOptions(parent=mynetwork)
)

managed_cluster = containerservice.ManagedCluster(
    managed_cluster_name,
    resource_group_name=resource_group.name,
        agent_pool_profiles=[{
        "count": 3,
        "max_pods": 110,
        "mode": "System",
        "name": "agentpool",
        "node_labels": {},
        "os_disk_size_gb": 30,
        "os_type": "Linux",
        "type": "VirtualMachineScaleSets",
        "vm_size": "Standard_DS2_v2",
        "vnet_subnet_id": subnet1.id,
    }],
        linux_profile={
        "admin_username": "testuser",
        "ssh": {
            "public_keys": [{
                "key_data": ssh_key.public_key_openssh,
            }],
        },
    },
    enable_rbac=True,
    dns_prefix=resource_group.name,

    kubernetes_version="1.18.14",
    service_principal_profile={
        "client_id": ad_app.application_id,
        "secret": ad_sp_password.value
    },
    network_profile=containerservice.ContainerServiceNetworkProfileArgs(
        network_plugin = "azure",
        network_mode= "transparent"),
    sku=containerservice.ManagedClusterSKUArgs(
        name="Basic",
        tier="Free",
    ),
)

creds = pulumi.Output.all(resource_group.name, managed_cluster.name).apply(
    lambda args:
    containerservice.list_managed_cluster_user_credentials(
        resource_group_name=args[0],
        resource_name=args[1]))   

# Export kubeconfig
encoded = creds.kubeconfigs[0].value
kubeconfig = encoded.apply(
    lambda enc: base64.b64decode(enc).decode())
pulumi.export("kubeconfig", kubeconfig)