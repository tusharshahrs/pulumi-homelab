[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

# Pulumi:  A Databricks workspace with vnet peering.  The vnet peering will peer to an already created virtual network. This is built in Python.
* Built using [azure-nextgen](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/) api
    * [resource groups](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/resources/resourcegroup/)
    * [databricks workspace](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/databricks/workspace/)
    * [virtual network peering](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/databricks/vnetpeering/) 

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use Azure](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/) (if your Azure CLI is configured, no further changes are required)
* An azure virtual network that is different from the one that will be created in this(automatically a new vnet is created for databricks) stack MUST already exist.

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
   Note:  that the mysubid: is the subscription id passed in as a secret
   ```
   $ pulumi config set location eastus2 # any valid azure region endpoint
   $ pulumi config set resource_group_name shaht-rg-peering-to-databricks
   $ pulumi config set name shaht-databricks
   $ pulumi config set mysubid --secret abcdefghijklmnopqrstuvwxz # mysubid is your azure subcription id
   $ pulumi config set stackreference shaht/azure-nextgen-virtualnetwork-py/dev
   $ pulumi config set workspacename myWorkspace
   ```

1. Run `pulumi up` to preview and deploy changes:   You must select `y` to continue
  
    ```
    $ pulumi up

    Previewing update (dev)
    View Live: https://app.pulumi.com/shaht/azure-nextgen-databricks/dev/previews/f3d29f8d-af23-4f43-972b-9f6ac65cfafa

        Type                                             Name                            Plan       
    +   pulumi:pulumi:Stack                              azure-nextgen-databricks-dev    create     
    +   ├─ azure-nextgen:resources/latest:ResourceGroup  shaht-databricks-resourcegroup  create     
    +   ├─ azure-nextgen:databricks/latest:Workspace     shaht-databricks-workspace      create     
    +   └─ azure-nextgen:databricks/latest:vNetPeering   shaht-databricks-vNetPeering    create     
    
    Resources:
        + 4 to create

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    >yes
    no
    details
    ```
1. Resources are created along with outputs
    ```
        Do you want to perform this update? yes
    Updating (dev)

    View Live: https://app.pulumi.com/shaht/azure-nextgen-databricks/dev/updates/49

        Type                                             Name                            Status      
    +   pulumi:pulumi:Stack                              azure-nextgen-databricks-dev    created     
    +   ├─ azure-nextgen:resources/latest:ResourceGroup  shaht-databricks-resourcegroup  created     
    +   ├─ azure-nextgen:databricks/latest:Workspace     shaht-databricks-workspace      created     
    +   └─ azure-nextgen:databricks/latest:vNetPeering   shaht-databricks-vNetPeering    created     
    
    Outputs:
        resource group location          : "eastus2"
        resource group name              : "shaht-databricks-vnet-rg"
        vnet peering name                : "databricks_peering"
        vnet peering peering_state       : "Initiated"
        vnet peering provisioning_state  : "Succeeded"
        vnet peering remote_address_space: {
            address_prefixes: [
                [0]: "10.0.0.0/22"
            ]
        }
        vnet peering urn                 : "urn:pulumi:dev::azure-nextgen-databricks::azure-nextgen:databricks/latest:vNetPeering::shaht-databricks-vNetPeering"
        workspace name                   : "myWorkspace"
        workspace status                 : "Succeeded"
        workspace url                    : "adb-7590616565503035.15.azuredatabricks.net"

    Resources:
        + 4 created

    Duration: 3m29s

    ```
1. View the outputs created via [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/)
    ```
    pulumi stack output
    Current stack outputs (10):
        OUTPUT                             VALUE
        resource group location            eastus2
        resource group name                shaht-databricks-vnet-rg
        vnet peering name                  databricks_peering
        vnet peering peering_state         Initiated
        vnet peering provisioning_state    Succeeded
        vnet peering remote_address_space  {"address_prefixes":["10.0.0.0/22"]}
        vnet peering urn                   urn:pulumi:dev::azure-nextgen-databricks::azure-nextgen:databricks/latest:vNetPeering::shaht-databricks-vNetPeering
        workspace name                     myWorkspace
        workspace status                   Succeeded
        workspace url                      adb-7590616565503035.15.azuredatabricks.net
    ```
1. Go to the [azure portal](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Databricks%2Fworkspaces) and validate that a Azure Databricks was created. For example: `myWorkspace` is created based on the configs from above.

1. The key thing to note is this:

    `vnet peering peering_state`         
    It needs to say `Initiated`
    
    This means that the vnet peering connection:
    databricks to secondvirtual network is `intialized`.  The connection will `NOT` show `connected` until the vnet  peering connection from the second virtualnetwork to databricks is triggered.
    
### Clean up
 1. Make sure all your `vnetpeering` pulumi stack is `destroyed` before you run this.  Note:  You have to run [pulumi refresh][https://www.pulumi.com/docs/reference/cli/pulumi_refresh/] before you [pulumi destroy](https://www.pulumi.com/docs/reference/cli/pulumi_destroy/) because the `vnet peering` status was changed to `connected` by another stack.
 1. `pulumi refresh`
 1. `pulumi destroy -y`   
 1. `pulumi stack rm dev`