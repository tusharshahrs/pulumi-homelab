import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

const primary = azure.core.getSubscription({});
const myroledefinition = new azure.authorization.RoleDefinition("my-RecoveryVaultDelete", {
    name: "my-RecoveryVaultDelete",
    scope: primary.then(primary => primary.id),
    assignableScopes: [primary.then(primary => primary.id)],
    description: "This is a custom role created",
    //roleDefinitionId:"4c6ed680-6ed6-6ed6-6ed6-50a6ed6b299a",
    permissions: [{
        actions: ["Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/delete","Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems/delete","Microsoft.RecoveryServices/vaults/backupconfig/read","Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/operationsStatus/read",
        "Microsoft.RecoveryServices/vaults/backupFabrics/backupProtectionIntent/delete",
        "Microsoft.RecoveryServices/vaults/backupFabrics/protectionContainers/protectedItems/recoveryPoints/restore/action","Microsoft.Compute/restorePointCollections/*"],
        notActions: [],
        dataActions: [],
        notDataActions: [],
    }],
});

export const roledefintion_name = myroledefinition.name;
export const roledefintion_id = myroledefinition.roleDefinitionId
