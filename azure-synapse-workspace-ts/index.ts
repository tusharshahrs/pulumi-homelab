import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as synapse from "@pulumi/azure-native/synapse";
import * as datalakestore from "@pulumi/azure-native/datalakestore";

import * as random from "@pulumi/random";
import { EncryptionState } from "@pulumi/azure-native/datalakestore/v20161101";

const name = 'shaht';
// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${name}-resourceGroup`);

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount(`${name}sa`, {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
    kind: storage.Kind.StorageV2,
});

// Export the primary key of the Storage Account
const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName }));
export const primaryStorageKey = storageAccountKeys.keys[0].value;

const sqlAdministratorLoginPassword = new random.RandomPassword(`${name}-randompassword`, {
    length: 16,
    special: true,
    overrideSpecial: `_!-%`,

});

/*const exampleStore = new azure.datalake.Store("exampleStore", {
    resourceGroupName: exampleResourceGroup.name,
    location: exampleResourceGroup.location,
    encryptionState: "Enabled",
    encryptionType: "ServiceManaged",
});
*/

const datalake = new datalakestore.Account(`${name}datalake`, {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    encryptionState: "Enabled",
});

export const resource_group_name =resourceGroup.name;
export const sqlrandompassword =sqlAdministratorLoginPassword.result;
export const datalake_store_account =datalake.name;