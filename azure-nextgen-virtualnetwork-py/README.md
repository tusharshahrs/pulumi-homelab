[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

# Pulumi:  A VirtualNetwork with two subnets on Azure-NextGen built in Python.
* Built using [azure-nextgen](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/) api
    * [resource groups](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/resources/resourcegroup/)
    * [virtual network](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/network/virtualnetwork/) 
    * [subnet](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/network/subnet/)

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use Azure](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/) (if your Azure CLI is configured, no further changes are required)

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

1. Populate the config via [pulumi config set](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/).

   Here are Azure regions [see this infographic](https://azure.microsoft.com/en-us/global-infrastructure/regions/) for a list of available regions)
   
   ```
   $ pulumi config set location eastus2 # any valid azure region endpoint
   $ pulumi config set network_name shaht-vnet-peering-to-databricks
   $ pulumi config set resource_group_name shaht-rg-peering-to-databricks
   $ pulumi config set virtual_network_cidr 10.0.0.0/23
   $ pulumi config set subnet_1_cidr 10.0.0.0/22
   $ pulumi config set subnet_2_cidr 10.0.2.0/23
   ```
1. Run `pulumi up` to preview and deploy changes: You must select `y` to continue
  
    ```
    $ pulumi up
    Previewing update (dev)

    View Live: https://app.pulumi.com/shaht/azure-nextgen-virtualnetwork-py/dev/previews/1217fc5f-f713-4cac-89f8-ce3617544783

        Type                                             Name                                             Plan       
    +   pulumi:pulumi:Stack                              azure-nextgen-virtualnetwork-py-dev              create     
    +   ├─ azure-nextgen:resources/latest:ResourceGroup  shaht-vnet-peering-to-databricks-resource-group  create     
    +   ├─ azure-nextgen:network/latest:VirtualNetwork   shaht-vnet-peering-to-databricks-virtualNetwork  create     
    +   ├─ azure-nextgen:network/latest:Subnet           shaht-vnet-peering-to-databricks-subnet1         create     
    +   └─ azure-nextgen:network/latest:Subnet           shaht-vnet-peering-to-databricks-subnet2         create     
    
    Resources:
        + 5 to create

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    yes
    ```
1. Resources are created along with outputs
    ```
    View Live: https://app.pulumi.com/shaht/azure-nextgen-virtualnetwork-py/dev/updates/10

     Type                                             Name                                             Status      
    +   pulumi:pulumi:Stack                              azure-nextgen-virtualnetwork-py-dev              created     
    +   ├─ azure-nextgen:resources/latest:ResourceGroup  shaht-vnet-peering-to-databricks-resource-group  created     
    +   ├─ azure-nextgen:network/latest:VirtualNetwork   shaht-vnet-peering-to-databricks-virtualNetwork  created     
    +   ├─ azure-nextgen:network/latest:Subnet           shaht-vnet-peering-to-databricks-subnet1         created     
    +   └─ azure-nextgen:network/latest:Subnet           shaht-vnet-peering-to-databricks-subnet2         created     
    
    Outputs:
        azure region                      : "eastus2"
        resource_group_name               : "shaht-rg-peering-to-databricks"
        virtual_network_cidr_block        : {
            address_prefixes: [
                [0]: "10.0.0.0/22"
            ]
        }
        virtual_network_name              : "shaht-vnet-peering-to-databricks"
        virtual_network_subnet1_cidr_block: "10.0.0.0/23"
        virtual_network_subnet1_cidr_name : "shaht-vnet-peering-to-databricks-subnet1"
        virtual_network_subnet2_cidr_block: "10.0.2.0/23"
        virtual_network_subnet2_cidr_name : "shaht-vnet-peering-to-databricks-subnet2"

    Resources:
        + 5 created
        ```
1. View the outputs created via [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/)
    ```
        pulumi stack output
    Current stack outputs (8):
        OUTPUT                              VALUE
        azure region                        eastus2
        resource_group_name                 shaht-rg-peering-to-databricks
        virtual_network_cidr_block          {"address_prefixes":["10.0.0.0/22"]}
        virtual_network_name                shaht-vnet-peering-to-databricks
        virtual_network_subnet1_cidr_block  10.0.0.0/23
        virtual_network_subnet1_cidr_name   shaht-vnet-peering-to-databricks-subnet1
        virtual_network_subnet2_cidr_block  10.0.2.0/23
        virtual_network_subnet2_cidr_name   shaht-vnet-peering-to-databricks-subnet2
    ```
1. Grab the [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) for this stack. The StackReference constructor takes as input a string of the form `<organization>/<project>/<stack>`, and lets you access the outputs of that stack.
    ```
    pulumi stack
    ```

    ```
        pulumi stack 
    Current stack is dev:
        Owner: shaht
        Last updated: 3 minutes ago (2020-11-09 09:22:35.966969 -0500 EST)
        Pulumi version: v2.13.2
    Current stack resources (6):
        TYPE                                                 NAME
        pulumi:pulumi:Stack                                  azure-nextgen-virtualnetwork-py-dev
        ├─ azure-nextgen:resources/latest:ResourceGroup      shaht-vnet-peering-to-databricks-resource-group
        ├─ azure-nextgen:network/latest:VirtualNetwork       shaht-vnet-peering-to-databricks-virtualNetwork
        ├─ azure-nextgen:network/latest:Subnet               shaht-vnet-peering-to-databricks-subnet1
        ├─ azure-nextgen:network/latest:Subnet               shaht-vnet-peering-to-databricks-subnet2
        └─ pulumi:providers:azure-nextgen                    default_0_2_4

    Current stack outputs (8):
        OUTPUT                              VALUE
        azure region                        eastus2
        resource_group_name                 shaht-rg-peering-to-databricks
        virtual_network_cidr_block          {"address_prefixes":["10.0.0.0/22"]}
        virtual_network_name                shaht-vnet-peering-to-databricks
        virtual_network_subnet1_cidr_block  10.0.0.0/23
        virtual_network_subnet1_cidr_name   shaht-vnet-peering-to-databricks-subnet1
        virtual_network_subnet2_cidr_block  10.0.2.0/23
        virtual_network_subnet2_cidr_name   shaht-vnet-peering-to-databricks-subnet2

    More information at: https://app.pulumi.com/shaht/azure-nextgen-virtualnetwork-py/dev
    ```
    This is the last line: `shaht/azure-nextgen-virtualnetwork-py/dev`
    
    Note yours will be something along the lines of:
    `yourname/azure-nextgen-virtualnetwork-py/dev`

 ### Clean up
 1. Make sure all your `OTHER` stacks that depend on this network have their resources all deleted `BEFORE` you clean up any networking resources.
 1. `pulumi destroy -y`   
 2. `pulumi stack rm dev`