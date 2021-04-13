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
for (let i = 0; i < 2; i++) {
    const subnet =  new network.Subnet(`${name}-subnet-${i}`, {
        resourceGroupName: resourceGroup.name,
        virtualNetworkName: mynetwork.name,
        serviceEndpoints: [{
            service: "Microsoft.KeyVault",
        }],
        addressPrefix: subnets_cidr_blocks[i],
    }, {parent: mynetwork});
    subnets.push(subnet)
}

// local config
const config = new pulumi.Config();
// reading in a secret 
// used pulumi config set --secret mytenant id via cli:  https://www.pulumi.com/docs/reference/cli/pulumi_config_set/
// Read in the value in the index.ts via the following:
// https://www.pulumi.com/docs/intro/concepts/secrets/#programmatically-creating-secrets
const mytenantid = config.getSecret("tenantid");

// https://www.pulumi.com/docs/reference/pkg/azure-native/keyvault/vault/

const vault = new keyvault.Vault(`${name}-vault`, {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        accessPolicies: [{
            objectId: "00000000-0000-0000-0000-000000000000",
            permissions: {
                certificates: [
                    "get",
                    "list",
                    "delete",
                    "create",
                    "import",
                    "update",
                    "managecontacts",
                    "getissuers",
                    "listissuers",
                    "setissuers",
                    "deleteissuers",
                    "manageissuers",
                    "recover",
                    "purge",
                ],
                keys: [
                    "encrypt",
                    "decrypt",
                    "wrapKey",
                    "unwrapKey",
                    "sign",
                    "verify",
                    "get",
                    "list",
                    "create",
                    "update",
                    "import",
                    "delete",
                    "backup",
                    "restore",
                    "recover",
                    "purge",
                ],
                secrets: [
                    "get",
                    "list",
                    "set",
                    "delete",
                    "backup",
                    "restore",
                    "recover",
                    "purge",
                ],
            },
            // interpolate:  https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings
            tenantId: pulumi.interpolate`${mytenantid}`,
        }],
        enabledForDeployment: false,
        enabledForDiskEncryption: true,
        enabledForTemplateDeployment: true,
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
            //virtualNetworkRules: "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/virtualNetworks/test-vnet/subnets/subnet1",
            virtualNetworkRules: [{
                id: subnets[0].id, 
            }],
        },
        createMode: "default",
        sku: {
            family: "A",
            name: "standard",
        },
        // interpolate:  https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings
        tenantId: pulumi.interpolate`${mytenantid}`,
    },
});


// Exports
export const resource_group_name = resourceGroup.name;
export const vault_name = vault.id;
