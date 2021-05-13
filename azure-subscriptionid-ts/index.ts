import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup");
const mysubscriptionId = resourceGroup.id.apply(id => id.split("/")[2]);
export const resourcegroup_name = resourceGroup.name

export const subscriptionId = pulumi.secret(mysubscriptionId)