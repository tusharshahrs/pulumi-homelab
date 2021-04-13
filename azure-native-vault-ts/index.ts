import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as keyvault from "@pulumi/azure-native/keyvault";
import { Config } from "@pulumi/pulumi";

// pass in a variable for name
const name = 'demo';

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${name}-resourceGroup`);

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
        enabledForDeployment: true  ,
        enabledForDiskEncryption: true,
        enabledForTemplateDeployment: true,
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
export const vault_name = vault.name;
