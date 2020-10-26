import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as network from "@pulumi/azure-nextgen/network/latest";
import * as compute from "@pulumi/azure-nextgen/compute/latest";
import * as iotcentral from "@pulumi/azure-nextgen/iotcentral/latest"

import { sshKey, projectName, stackName,} from "./config";
import  { tagAllResources, } from "./taggable";

const config = new pulumi.Config()
const location = config.get("location") || "westus";
const myname = config.get("nameprefix");
const mynetworkcidrblock = config.get("network_cidr_block")
/**
 * Resources
 */

const baseTags = {
    'cost-center': projectName,
    'stack': stackName,
};

tagAllResources({"costcenter": projectName});

// Create an Azure Resource Group. All resources will share a resource group.
const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    resourceGroupName: `${myname}-rg`,
    location,
    tags: baseTags,
});

// Create a virtualnetwork (~vpc)
const virtualNetwork = new network.VirtualNetwork("virtualNetwork", {
     resourceGroupName: resourceGroup.name,
     location,
     virtualNetworkName: `${myname}-vnet`,
     addressSpace: {addressPrefixes: [`${mynetworkcidrblock}`]},
     tags: baseTags,
    });

// create subnet 1
const subnet1 = new network.Subnet("subnet1", {
    subnetName: `${myname}-subnet-1`,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefix: "10.0.0.0/23",
});

//create subnet 2
const subnet2 = new network.Subnet("subnet2", {
    subnetName: `${myname}-subnet-2`,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefix: "10.0.2.0/23",
});

// Create a Public IP and security group resources
const network_security_group = new network.NetworkSecurityGroup("networkSecurityGroup", 
 {
     location,
     resourceGroupName: resourceGroup.name,
     networkSecurityGroupName: `${myname}-nsg`, 
});

const security_rule  = new network.SecurityRule("securityRule", {
    access:"Deny",
    destinationAddressPrefix:"11.0.0.0/8",
    destinationPortRange:"8080",
    direction:"Outbound",
    networkSecurityGroupName: network_security_group.name,
    protocol: "*",
    priority: 100,
    resourceGroupName: resourceGroup.name,
    sourceAddressPrefix: "10.0.0.0/8",
    sourcePortRange: "*",
    securityRuleName: `${myname}-rule1`,
}, {parent: network_security_group})


// create instances
const instanceCount = config.getNumber("instanceCount") ?? 1;

 const iotCentralApp = new iotcentral.App("iotapp", {
    displayName: "My IoT Central App",
    location:location,
    resourceGroupName: resourceGroup.name,
    resourceName: "myiotdevice1",
    subdomain: "my-iot-central-app",
    sku: {
        name: "ST1",
    },
});


const initScript = `#!/bin/bash\n
echo "Hello, World from Pulumi!" > index.html
nohup python -m SimpleHTTPServer 80 &`;

const userName = "pulumi-admin";
const password = config.requireSecret("password");

for (let i = 0; i < instanceCount; i ++)
    {
    const publicIp = new network.PublicIPAddress(`${myname}-ip-${i}`, {
        publicIpAddressName: `${myname}-ip-${i}`,
        resourceGroupName: resourceGroup.name,
        location,
        publicIPAllocationMethod: "Dynamic",
        });

    const networkInterface = new network.NetworkInterface(`${myname}-nic-${i}`, {
        resourceGroupName: resourceGroup.name,
        location,
        networkInterfaceName: `${myname}-nic-${i}`,
        ipConfigurations: [{
            name: `${myname}-nic-${i}-ipcfg`,
            subnet: {id: subnet1.id},
            privateIPAllocationMethod: "Dynamic",
            publicIPAddress: { id: publicIp.id},
        }],
    }, {parent: publicIp });

    const myvmName = `${projectName}-vm-${i}`;
    const webServer = new compute.VirtualMachine(myvmName, {
        resourceGroupName: resourceGroup.name,
        location,
        vmName: myvmName,
        networkProfile: {
            networkInterfaces: [{ id: networkInterface.id}],
        },
        hardwareProfile: {
            vmSize: "Standard_A0",
        },

        osProfile: {
            computerName: "hostname",
            adminUsername: userName,
            adminPassword: password,
            customData: Buffer.from(initScript).toString("base64"),
            linuxConfiguration: {
                disablePasswordAuthentication: true,
                ssh: {
                    publicKeys: [{
                        keyData: sshKey.publicKeyOpenssh,
                        path: `/home/${userName}/.ssh/authorized_keys`, // reference the userName variable 
                    }]
                },
            },
        },
        storageProfile: {
            osDisk: {
                createOption: "FromImage",
                name: myvmName,
            },
            imageReference: {
                publisher: "canonical",
                offer: "UbuntuServer",
                sku: "18.04-LTS",
                version: "latest",
            },
        },
       
    }, {parent: networkInterface });
    }
export const resource_group = resourceGroup.name;
export const network_cidr_block = virtualNetwork.addressSpace;
export const network_name = virtualNetwork.name;
export const network_subnet_1 = subnet1.name;
export const network_subnet_1_cidr = subnet1.addressPrefix;
export const network_subnet_2 = subnet2.name;
export const network_subnet_2_cidr = subnet2.addressPrefix;
export const network_security_group_name = network_security_group.name;
export const security_rule_name = security_rule.name;
export const azure_region = location;
export const number_of_vms_launched = instanceCount;
export const iot_central_app_name = iotCentralApp.name;
export const iot_central_app_name_sku = iotCentralApp.sku;