import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as storage from "@pulumi/azure-nextgen/storage/latest";
import * as web from "@pulumi/azure-nextgen/web/v20200601";

import * as random from "@pulumi/random";

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
    resourceGroupName: pulumi.interpolate`${myname}-rg-${suffix.result}`,   
    location: `${mylocation}`,
});

// Create an Azure resource (Storage Account).  Azure Functions require storage Accounts for internal needs
const storageAccount = new storage.StorageAccount("storageaccount", {
    resourceGroupName: resourceGroup.name,
    accountName: pulumi.interpolate`${myname}stgacct${suffix.result}`,
    location: resourceGroup.location,
    sku: {
        //name: storage.SkuName.Standard_LRS,
        name: "Standard_LRS",
    },
    kind: "StorageV2",
    //kind: storage.Kind.StorageV2,
});

const plan = new web.AppServicePlan("appserviceplan", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    name: "consumption-plan",
    sku: {
        name: "Y1",
        tier: "Dynamic",
        //name: "F1",
        //tier: "Dynamic",
        //tier: "Free",
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


// Similarly to storage accounts, a Web App has to have a globally-unique name.
const app = new web.WebApp("functionapp", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    name: pulumi.interpolate`${myname}-funapp-${suffix.result}`,
    serverFarmId: plan.id,
    kind: "functionapp",
    siteConfig: {
        appSettings: [
            {name:"AzureWebJobsStorage", value: storageConnectionString },
            {name:"FUNCTIONS_EXTENSION_VERSION",value: "~3"},
            {name:"FUNCTIONS_WORKER_RUNTIME", value: "node"},
            {name:"WEBSITE_NODE_DEFAULT_VERSION",value: "10.4.1"},
            {name:"WEBSITE_RUN_FROM_PACKAGE", value: "https://mikhailworkshop.blob.core.windows.net/zips/app.zip"},
        ]
    }
});

export const endpoint = pulumi.interpolate`https://${app.defaultHostName}/api/hello`;