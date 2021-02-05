import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as authorization from "@pulumi/azure-nextgen/authorization/latest";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    resourceGroupName: "my-rg",
    location: "eastus2",
});


const roleAssignment = new authorization.RoleAssignment("roleAssignment", {
    // principalId:  https://www.pulumi.com/docs/reference/pkg/azure-nextgen/authorization/roleassignment/#principalid_nodejs
    // It can point to a user, service principal, or security group
    properties: {
        principalId: "REPLACE_WITH_SERVICE_PRINCIPAL_ID",
        roleDefinitionId: "/subscriptions/4004a9fd-d58e-48dc-aeb2-4a4aec58606f/providers/Microsoft.Authorization/roleDefinitions/de139f84-1756-47ae-9be6-808fbbe84772",
    },
    
    roleAssignmentName: "roleAssignmentName",
    scope: "scope",
});