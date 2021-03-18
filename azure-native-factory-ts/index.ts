import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

 // Create an Azure Resource Group
const resourceGroup = new azure_native.resources.ResourceGroup("factory-rg");

const factory = new azure_native.datafactory.Factory("datafactory", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
});