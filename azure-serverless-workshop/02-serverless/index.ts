import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

// Create an Azure Resource Group
const resourceGroup = new azure.core.ResourceGroup("shaht-serverless-my-group");

// Create an Azure resource (Storage Account)
const storageAccount = new azure.storage.Account("shahtserlessstg", {
    // The location for the storage account will be derived automatically from the resource group.
    resourceGroupName: resourceGroup.name,
    accountTier: "Standard",
    accountReplicationType: "LRS",
});

// Defining a consumption plan 
const plan = new azure.appservice.Plan("shaht-serverless-asp", {
    resourceGroupName: resourceGroup.name,
    kind: "FunctionApp",
    sku: {
        tier: "Dynamic",
        size: "Y1",
    },
});

const container = new azure.storage.Container("zips",{
    storageAccountName: storageAccount.name,
    containerAccessType: "private",
});

const blob = new azure.storage.Blob("zip", {
    storageAccountName: storageAccount.name,
    storageContainerName: container.name,
    type: "Block",
    source: new pulumi.asset.FileArchive("./functions"),
});

const codeBlobUrl = azure.storage.signedBlobReadUrl(blob, storageAccount);

//Create a Function app
const app = new azure.appservice.FunctionApp("shaht-serverless-function-app", {
    resourceGroupName: resourceGroup.name,
    appServicePlanId: plan.id,
    storageAccountName: storageAccount.name,
    storageAccountAccessKey: storageAccount.primaryAccessKey,
    version: "~3",
    appSettings: {
        FUNCTION_WORKER_RUNTIME: "node",
        WEBSITE_NODE_DEFAULT_VERSION: "10.14.1",
        WEBSITE_RUN_FROM_PACKAGE: codeBlobUrl,
    }
});
// Export the connection string for the storage account
export const resourceGroupString = resourceGroup.name
export const endpoint = pulumi.interpolate`https://${app.defaultHostname}/api/hello`;
export const connectionString = storageAccount.primaryConnectionString;
