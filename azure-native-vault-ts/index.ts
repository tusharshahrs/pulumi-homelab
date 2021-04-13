import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as network from "@pulumi/azure-native/network";

import * as keyvault from "@pulumi/azure-native/keyvault";
import { Config } from "@pulumi/pulumi";

// pass in a variable for name
const name = 'demo';

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${name}-resourceGroup`);

const mynetwork = new network.VirtualNetwork(`${name}-vnet`, { 
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    addressSpace: {
        addressPrefixes: ["10.0.0.0/22"],
    },
})

const subnets_cidr_blocks = ["10.0.0.0/23", "10.0.2.0/23"]
const subnets = [];

const subnet1 =  new network.Subnet(`${name}-subnet-1`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: mynetwork.name,
    serviceEndpoints: [{
        service: "Microsoft.KeyVault",
    }],
    addressPrefix: "10.0.0.0/23",
    }, {parent: mynetwork});

const subnet2 =  new network.Subnet(`${name}-subnet-2`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: mynetwork.name,
    serviceEndpoints: [{
        service: "Microsoft.KeyVault",
    }],
    addressPrefix: "10.0.2.0/23",
    }, {parent: mynetwork, dependsOn: subnet1},);

subnets.push(subnet1)
subnets.push(subnet2)
// local config
const config = new pulumi.Config();
// reading in a secret 
// used pulumi config set --secret mytenant id via cli:  https://www.pulumi.com/docs/reference/cli/pulumi_config_set/
// Read in the value in the index.ts via the following:
// https://www.pulumi.com/docs/intro/concepts/secrets/#programmatically-creating-secrets
const mytenantid = config.getSecret("tenantid");

// https://www.pulumi.com/docs/reference/pkg/azure-native/keyvault/vault/

const vault = new keyvault.Vault(`${name}-vault`, {
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    properties: {
        sku: {
            family: "A",
            name: "standard",
        },
        // interpolate:  https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings
        tenantId: pulumi.interpolate`${mytenantid}`,
        enabledForDeployment: false,
        enabledForDiskEncryption: true,
        enabledForTemplateDeployment: true,
        createMode: "default",
        networkAcls: {
            bypass: "AzureServices",
            defaultAction: "Deny",
            ipRules: [
                {
                    value: "124.56.78.91",
                },
                {
                    value: "124.56.78.92/32",
                },
            ],
            virtualNetworkRules: [
                { id: subnets[0].id,}, 
                { id: subnets[1].id }],
        },
        accessPolicies: [{
            objectId: "00000000-0000-0000-0000-000000000000",
            // interpolate:  https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings
            tenantId: pulumi.interpolate`${mytenantid}`,
            permissions: {
                //secrets: ["get","list","set","delete","backup","restore","recover","purge",],
                secrets: ["get","list","set","delete","backup","restore","recover","purge"],
                //certificates: ["get","list","delete","create","import","update","managecontacts","getissuers","listissuers","setissuers","deleteissuers","manageissuers","recover","purge",],
                certificates: ["get","list","delete","create","import","update","managecontacts","getissuers","listissuers","setissuers","deleteissuers","manageissuers","recover","purge"],
                //keys: ["encrypt","decrypt","wrapKey","unwrapKey","sign","verify","get","list","create","update","import","delete","backup","restore","recover","purge",],
                keys: ["encrypt","decrypt","wrapKey","unwrapKey","sign","verify","get","list","create","update","import","delete","backup","restore","recover","purge"],
            },
        }],
    },
}, {parent: mynetwork, dependsOn: [subnet1, subnet2]});


// Exports
export const resource_group_name = resourceGroup.name;
export const network_name = mynetwork.name;
export const network_subnet_1_name = subnet1.name;
export const network_subnet_2_name = subnet2.name;
export const vault_name = vault.name;
export const vault_type = vault.type;
