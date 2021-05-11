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
            opts=ResourceOptions(ignore_changes=["subnet1", "subnet2"])
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