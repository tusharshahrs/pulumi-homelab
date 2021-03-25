import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as network from "@pulumi/azure-native/network";
//import * as cache from "@pulumi/azure-native/cache";
import * as cache from "@pulumi/azure-native/cache/v20200601";

// Create an Azure Resource Group
const resourceGroup1 = new resources.ResourceGroup("rg-redis-1_");
const resourceGroup2 = new resources.ResourceGroup("rg-redis-2_",
{
    location:"eastus"
});

const vnet1 = new network.VirtualNetwork("vnet-redis-1_",
{
    resourceGroupName: resourceGroup1.name,
    location:resourceGroup1.location,
    addressSpace: { addressPrefixes: ["10.1.0.0/16"]}
});

const subnet1 = new network.Subnet("subnet-redis-1", {
    virtualNetworkName: vnet1.name,
    resourceGroupName: resourceGroup1.name,
    addressPrefix: "10.1.1.0/24",
}, {dependsOn: vnet1});

const vnet2 = new network.VirtualNetwork("vnet-redis-2_",
{
    resourceGroupName: resourceGroup2.name,
    location:resourceGroup2.location,
    addressSpace: { addressPrefixes: ["10.2.0.0/16"]}
});

const subnet2 = new network.Subnet("subnet-redis-2", 
{
    virtualNetworkName: vnet2.name,
    resourceGroupName: resourceGroup2.name,
    addressPrefix: "10.2.1.0/24",
}, {dependsOn: vnet2});


const vnetpeering1 = new network.VirtualNetworkPeering("vnet-peering-redis1", {
    resourceGroupName: resourceGroup1.name,
    virtualNetworkName: vnet1.name,
    allowGatewayTransit: false,
    allowForwardedTraffic: true,
    allowVirtualNetworkAccess: true,
    useRemoteGateways: false,
    remoteVirtualNetwork: {
        id: vnet2.id,
    },
    virtualNetworkPeeringName: "vnet-peering-redis1"
},{dependsOn: [vnet1, vnet2]});

const vnetpeering2 = new network.VirtualNetworkPeering("vnet-peering-redis2", {
    resourceGroupName: resourceGroup2.name,
    virtualNetworkName: vnet2.name,
    allowGatewayTransit: false,
    allowForwardedTraffic: true,
    allowVirtualNetworkAccess: true,
    useRemoteGateways: false,
    remoteVirtualNetwork: {
        id: vnet1.id,
    },
    virtualNetworkPeeringName: "vnet-peering-redis2"
},{dependsOn: [vnetpeering1]});


export const vnetpeering_name1 = vnetpeering1.name;
export const vnet_peering_state1 = vnetpeering1.provisioningState;
export const vnetpeering_name2 = vnetpeering2.name;
export const vnet_peering_state2 = vnetpeering2.provisioningState;

// https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.management.redis.models.sku?view=azure-dotnet
// https://github.com/pulumi/pulumi-azure-native/issues/641
const redis1 = new cache.Redis("redis-1", {
    enableNonSslPort: true,
    resourceGroupName: resourceGroup1.name,
    location: resourceGroup1.location,
    name: "cache1",
    minimumTlsVersion: "1.2",
    shardCount: 1,
    sku: {
        capacity: 1,
        name: "Premium",
        family: "P",
    },
    subnetId: subnet1.id,
});

const redis2 = new cache.Redis("redis-2", {
    enableNonSslPort: true,
    resourceGroupName: resourceGroup2.name,
    location: resourceGroup2.location,
    name: "cache2",
    minimumTlsVersion: "1.2",
    shardCount: 1,
    sku: {
        capacity: 1,
        name: "Premium",
        family: "P",
    },
    subnetId: subnet2.id,
});

const redis2_linkedServer = new cache.LinkedServer("redis-linkedserver", {
    linkedRedisCacheId: redis2.id,
    linkedRedisCacheLocation: resourceGroup2.location,
    linkedServerName: redis2.name,
    name: redis1.name,
    resourceGroupName: resourceGroup1.name,
    serverRole: "Secondary",
},{dependsOn: [redis1, redis2]});

export const resourceGroup1_name = resourceGroup1.name;
export const resourceGroup2_name = resourceGroup2.name;
export const vnet1_name = vnet1.name;
export const vnet2_name = vnet2.name;
//export const vnet1_id = vnet1.id;
//export const vnet2_id = vnet2.id;
export const subnet1_name = subnet1.name;
export const subnet2_name = subnet2.name;
//export const subnet1_id = subnet1.id;
//export const subnet2_id = subnet2.id;
export const redis1_name = redis1.name;
export const redis2_name = redis2.name;
export const redis2_linkedserver_name = redis2_linkedServer.name;