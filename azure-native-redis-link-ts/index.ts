import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as network from "@pulumi/azure-native/network";

// Create an Azure Resource Group
const resourceGroup1 = new resources.ResourceGroup("rg-redis-1");
const resourceGroup2 = new resources.ResourceGroup("rg-redis-2",
{
    location:"eastus"
});

const vnet1 = new network.VirtualNetwork("vnet-redis-1",
{
    resourceGroupName: resourceGroup1.name,
    location:resourceGroup1.location,
    addressSpace: { addressPrefixes: ["10.1.0.0/16"]}
});

const redissubnet1 = new network.Subnet("subnet-redis-1", {
    virtualNetworkName: vnet1.name,
    resourceGroupName: resourceGroup1.name,
    addressPrefix: "10.1.1.0/24",
});

const vnet2 = new network.VirtualNetwork("vnet-redis-2",
{
    resourceGroupName: resourceGroup2.name,
    location:resourceGroup2.location,
    addressSpace: { addressPrefixes: ["10.2.0.0/16"]}
});

const redissubnet2 = new network.Subnet("subnet-redis-2", 
{
    virtualNetworkName: vnet2.name,
    resourceGroupName: resourceGroup2.name,
    addressPrefix: "10.2.1.0/24",
});

export const resourceGroup1name = resourceGroup1.name;
export const resourceGroup2name = resourceGroup2.name;
export const vnet1name = redissubnet1.name;
export const vnet2name = vnet2.name;
export const subnet1name = redissubnet1.name
export const subnet2name = redissubnet2.name;