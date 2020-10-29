import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as storage from "@pulumi/azure-nextgen/storage/latest";
import { containerName, mylocation, projectName, stackName, myname } from "./config";

//const config = new pulumi.Config();
//const mylocation = config.get("location");
// const myname = "shahtworkshop";
//const mylocation = "eastus2";

//const projectName = pulumi.getProject()
//const stackName = pulumi.getStack()

const baseTags = {
    "myproject": projectName,
    "stack": stackName,
    "cost-center": "1234",
    "env": "dev",
    "team": "engineering",
};

const resourceGroup = new resources.ResourceGroup(`${myname}-rg`, {
    resourceGroupName: `${myname}-rg`,
    location: mylocation,
    tags: baseTags,
});

const storageAccount = new storage.StorageAccount(`${myname}-storage`, {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    accountName: `${myname}account`,
    kind: "StorageV2",
    sku: {
        name: "Standard_LRS",
    },
    tags: baseTags,
});

const container = new storage.BlobContainer(`${myname}-container`, {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: containerName,
});
export const resourcegroup = resourceGroup.name;
export const azurelocation = resourceGroup.location;
export const accountName = storageAccount.name;
export const containername = container.name;