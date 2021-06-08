import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as authorization from "@pulumi/azure-native/authorization";

const name="shaht"
// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${name}-resourceGroup`);

const roleDefinition = new authorization.RoleDefinition(`${name}-roleDefinition`, {
    roleDefinitionId: "roleDefinitionId",
    scope: "scope",
    roleName:`${name}-roleDefinition`,
    description: 'mycustom RBAC role that allows recovery vaults to be deleted.',
});