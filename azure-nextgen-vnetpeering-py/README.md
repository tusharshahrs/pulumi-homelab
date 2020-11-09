[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

# Pulumi:  Vnetpeering virtualnetwork TO databricks workspace vnet. This is built in Python.
* Built using [azure-nextgen](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/) api
    * [virtual network peering](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/databricks/vnetpeering/) 

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use Azure](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/) (if your Azure CLI is configured, no further changes are required)
* An azure virtual network that is different from the one that will be created in this(automatically a new vnet is created for databricks) stack MUST already exist.
* An azure databricks workspace must be up and runnig and have the vnet peering initated.

### Creating a new `Pulumi`.stackname`.yaml`

1. Initialize a new stack called: `dev` via [pulumi stack init](https://www.pulumi.com/docs/reference/cli/pulumi_stack_init/). 
      ```
      $ pulumi stack init dev
      ```

1. Login to Azure CLI (you will be prompted to do this during deployment if you forget this step):
      ```
      $ az login
      ```

1. Create a Python virtualenv, activate it, and install dependencies:

    This installs the dependent packages [needed](https://www.pulumi.com/docs/intro/concepts/how-pulumi-works/) for our Pulumi program.

    ```bash
    $ python3 -m venv venv
    $ source venv/bin/activate
    $ pip3 install -r requirements.txt
    ```

1. Populate the config via [pulumi config set](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/)

   Here are Azure regions [see this infographic](https://azure.microsoft.com/en-us/global-infrastructure/regions/) for a list of available regions).  Please change the config VALUES to whatever you want.
   Note:  that the subid: is the subscription id passed in as a secret
   ```
   $ pulumi config set subid --secret abcdefghijklmnopqrstuvwxz # subid is your azure subcription id
   $ pulumi config set stackreference shaht/azure-nextgen-virtualnetwork-py/dev

   ```

1. Run `pulumi up` to preview and deploy changes:   You must select `y` to continue
  
    ```
    $ pulumi up
    Previewing update (dev)

    View Live: https://app.pulumi.com/shaht/azure-nextgen-vnetpeering-py/dev/previews/3b308451-2d6b-4d83-a7b8-cee6c3e98a88

        Type                                                   Name                              Plan       
    +   pulumi:pulumi:Stack                                    azure-nextgen-vnetpeering-py-dev  create     
    +   └─ azure-nextgen:network/latest:VirtualNetworkPeering  virtualNetworkPeering             create     
    
    Resources:
        + 2 to create

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    > yes
    no
    details
    ```
1. Resources are created along with outputs
    ```
    
    Do you want to perform this update? yes
    Updating (dev)
    View Live: https://app.pulumi.com/shaht/azure-nextgen-vnetpeering-py/dev/updates/21

    Type                                            Name
    Status      
    +   pulumi:pulumi:Stack                                    azure-nextgen-vnetpeering-py-dev  created     
    +   └─ azure-nextgen:network/latest:VirtualNetworkPeering  virtualNetworkPeering             created     
    
    Outputs:
        vnet peering name                : "shaht-vnet-peering-back-to-databricks"
        vnet peering peering_state       : "Connected"
        vnet peering provisioning_state  : "Succeeded"
        vnet peering remote_address_space: {
            address_prefixes: [
                [0]: "10.139.0.0/16"
            ]
        }
        vnet peering urn                 : "urn:pulumi:dev::azure-nextgen-vnetpeering-py::azure-nextgen:network/latest:VirtualNetworkPeering::virtualNetworkPeering"

    Resources:
        + 2 created

    Duration: 31s
    ```

1. View the outputs created via [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/)
    ```
        pulumi stack output
    Current stack outputs (5):
        OUTPUT                             VALUE
        vnet peering name                  shaht-vnet-peering-back-to-databricks
        vnet peering peering_state         Connected
        vnet peering provisioning_state    Succeeded
        vnet peering remote_address_space  {"address_prefixes":["10.139.0.0/16"]}
        vnet peering urn                   urn:pulumi:dev::azure-nextgen-vnetpeering-py::azure-nextgen:network/latest:VirtualNetworkPeering::virtualNetworkPeering
    ```

1. The key thing to note is this:

    `vnet peering peering_state`         
    It needs to say `Connected`
    
    This means that the vnet peering connection:
    databricks to secondvirtual network is `connected`.  You can verify this in the azure portal.
    
### Clean up
 1. [pulumi destroy](https://www.pulumi.com/docs/reference/cli/pulumi_destroy/) to clean up.
 1. `pulumi destroy -y`   
 1. `pulumi stack rm dev`