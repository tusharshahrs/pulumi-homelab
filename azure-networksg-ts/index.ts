import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as network from "@pulumi/azure-native/network";

const name="demo";
// Create an Azure Resource Group https://www.pulumi.com/docs/reference/pkg/azure-native/resources/resourcegroup/
const resourceGroup = new resources.ResourceGroup(`${name}-resourceGroup`, { 
    resourceGroupName: "azure-native-test-project"});

// Create a virtual network  https://www.pulumi.com/docs/reference/pkg/azure-native/network/virtualnetwork/#create-virtual-network
const virtualNetwork = new network.VirtualNetwork(`${name}-virtualnetwork`, {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    //virtualNetworkName: `${name}-virtualnetwork`,
    addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
});

// create a network security group with rule https://www.pulumi.com/docs/reference/pkg/azure-native/network/networksecuritygroup/#create-network-security-group-with-rule
const mynetworkSecurityGroup = new network.NetworkSecurityGroup(`${name}-networkSecurityGroup`, {
    location: resourceGroup.location,
    //networkSecurityGroupName: `${name}-networkSecurityGroup`,
    resourceGroupName: resourceGroup.name,
});


const securityRule = new network.SecurityRule(`${name}-securityRule1`, {
    access: "Allow",
    destinationAddressPrefix: "*",
    destinationPortRange: "80",
    direction: "Inbound",
    networkSecurityGroupName: mynetworkSecurityGroup.name,
    priority: 100,
    protocol: "*",
    resourceGroupName: resourceGroup.name,
    //securityRuleName: `${name}-securityRule1`,
    sourceAddressPrefix: "10.0.0.0/8",
    sourcePortRange: "*",
}, {parent: mynetworkSecurityGroup});

// Create subnet1 https://www.pulumi.com/docs/reference/pkg/azure-native/network/subnet/#create-subnet
const subnet1 = new network.Subnet(`${name}-subnet1`, {
    resourceGroupName: resourceGroup.name,
    addressPrefix: "10.0.1.0/24",
    //subnetName: `${name}-subnet1`,
    virtualNetworkName: virtualNetwork.name,
    networkSecurityGroup: { id: mynetworkSecurityGroup.id},
}, {parent: virtualNetwork});


export const resourcegroup_name = resourceGroup.name;
export const virtualnetwork_name = virtualNetwork.name;
export const virtualnetwork_subnet1_name = subnet1.name;
export const networksecuritygroup_name = mynetworkSecurityGroup.name;
export const securityrule1_name = securityRule.name;