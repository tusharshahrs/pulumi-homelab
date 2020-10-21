import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as network from "@pulumi/azure-nextgen/network/latest";

import * as storage from "@pulumi/azure-nextgen/storage/latest";
import { sshKey, projectName, stackName} from "./config";

const config = new pulumi.Config()
const location = config.get("location") || "westus";
const myname = config.get("nameprefix");
const mynetworkcidrblock = config.get("network_cidr_block")
const mysubnetcidrblock = config.get("subnet_cidr_block")
/**
 * Resources
 */

const baseTags = {
    'cost-center': projectName,
    'stack': stackName,
};


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
})



/* for (let i = 0; i < mysubnetcidrblock.le ; i++) {
    const subnet = new network.Subnet(`${myname}-subnet-${i}`,
        {
        resourceGroupName: resourceGroup.name,
        virtualNetworkName: virtualNetwork.name,
        addressPrefixes: [mysubnetcidrblock[i]],
        }
    )}); */

// Create a subnet that uses that network.
/* 
// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    accountName: "mystorageaccount",
    location: resourceGroup.location,
    sku: {
        name: "Standard_LRS",
    },
    kind: "StorageV2",
});

// Export the primary key of the Storage Account
const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName }));
export const primaryStorageKey = storageAccountKeys.keys[0].value; */

export const my_resource_group = resourceGroup.name;
export const my_network_cidr_block = virtualNetwork.addressSpace;
export const my_network_name = virtualNetwork.name;
export const my_network_subnet_1 = subnet1.name;
export const my_network_subnet_1_cidr = subnet1.addressPrefix;
export const my_network_subnet_2 = subnet2.name;
export const my_network_subnet_2_cidr = subnet2.addressPrefix;
export const my_network_security_group = network_security_group.name;
export const my_security_rule = security_rule.name;

export const my_azure_region = location;