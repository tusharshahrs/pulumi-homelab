import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as storage from "@pulumi/azure-nextgen/storage/latest";
import * as azure from "@pulumi/azure"; // For Blob Storage 
import * as random from "@pulumi/random";

const config = new pulumi.Config();
const myname = config.get("name") || "demo";
const mylocation = config.get("location") || "westus";

// This is needed because of there is no autonaming in azure-nextgen:
// https://github.com/pulumi/pulumi-azure-nextgen/issues/5
const suffix = new random.RandomString("suffix", {
    length: 4,
    special: false,
    upper: false,
    number: true,
});

// Create an Azure Resource Group.  This must be unique across azure.
const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    resourceGroupName: pulumi.interpolate`${myname}-rg-${suffix.result}`,   
    location: `${mylocation}`,
});

// Create an Azure resource (Storage Account). accountName has to be unique across all of azure subscription
const storageAccount = new storage.StorageAccount("storageAccount", {
    resourceGroupName: resourceGroup.name,
    accountName: pulumi.interpolate`${myname}storageact${suffix.result}`,
    location: resourceGroup.location,
    allowBlobPublicAccess: true,
    sku: {
        name: "Standard_LRS",
    },
    kind: "StorageV2",
});

export const resourcegroup_name = resourceGroup.name;
export const storage_account_name = storageAccount.name;

// Creates BlobContainer.  This is a requirement for the storage blob.
const blobContainer = new storage.BlobContainer("blobContainer", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    containerName: pulumi.interpolate`${myname}-blobcontainer-${suffix.result}`,
    publicAccess: "Blob",
});

// This is old azure code(not azure next gen)
const blobStorage = new azure.storage.Blob("blobStorage", {
    storageAccountName: storageAccount.name,
    storageContainerName: blobContainer.name,
    name: pulumi.interpolate`${myname}-blob-${suffix.result}`,
    type: "Block",
    source: new pulumi.asset.FileAsset(`./www/index.html`),
    contentType: "text/html"
    
}, {dependsOn: blobContainer});

export const blobContainer_name = blobContainer.name;
export const blobstorage_name = blobStorage.name;
export const blobstorage_url = blobStorage.url;