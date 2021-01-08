import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as storage from "@pulumi/azure-nextgen/storage/latest";
import * as web from "@pulumi/azure-nextgen/web/v20200601";

import * as random from "@pulumi/random";

//const name = "shaht";

const config = new pulumi.Config();
const myname = config.get("name");
const mylocation = config.get("location");

// This is needed because of there is no autonaming in azure-nextgen:
// https://github.com/pulumi/pulumi-azure-nextgen/issues/5
const suffix = new random.RandomString("suffix", {
    length: 4,
    special: false,
    upper: false,
    number: true,
});

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    //resourceGroupName: "my-rg",
    resourceGroupName: pulumi.interpolate`${myname}-rg-${suffix.result}`,   
    location: `${mylocation}`,
});

// Create an Azure resource (Storage Account).  Azure Functions require storage Accounts for internal needs
const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    accountName: pulumi.interpolate`${myname}stgacct${suffix.result}`,
    location: resourceGroup.location,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
    kind: storage.Kind.StorageV2,
});

const plan = new web.AppServicePlan("appserviceplan", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    name: "consumption-plan",
    sku: {
        name: "Y1",
        tier: "Dynamic",
    },
});

export const resourcegroup_name = resourceGroup.name;
export const storage_account_name = storageAccount.name;

/* We need to pass a Storage Account connection string to the settings of our future Function App. As this information is sensitive, Azure doesn't return it by default in the outputs of the Storage Account resource.
   We need to make a separate invocation to the listStorageAccountKeys function to retrieve storage account keys. 
   This invocation can only be run after the storage account is created. 
   Therefore, we must place it inside an apply call that depends on a storage account 
*/
export const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) => storage.listStorageAccountKeys({resourceGroupName, accountName}));
export const primaryStorageKey = storageAccountKeys.keys[0].value;
export const storageConnectionString = pulumi.interpolate`DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${primaryStorageKey}`;
/*
// Export the primary key of the Storage Account
const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName }));
export const primaryStorageKey = storageAccountKeys.keys[0].value; */