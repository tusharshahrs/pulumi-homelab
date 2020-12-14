import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
/**
 * ServiceRoleArgs describe the parameters to a ServiceRole component.
 */
export interface ServiceRoleArgs {
    /**
     * The service associated with this role.
     */
    readonly service: pulumi.Input<string>;
    /**
     * The description of the role.
     */
    readonly description?: pulumi.Input<string>;
    /**
     * One or more managed policy ARNs to attach to this role.
     */
    readonly managedPolicyArns?: string[];
}
/**
 * The ServiceRole component creates an IAM role for a particular service and attaches to it a list of well-known
 * managed policies.
 */
export declare class ServiceRole extends pulumi.ComponentResource {
    readonly role: pulumi.Output<aws.iam.Role>;
    /**
     * Create a new ServiceRole.
     *
     * @param name The _unique_ name of this component.
     * @param args The arguments for this cluster.
     * @param opts A bag of options that control this component's behavior.
     */
    constructor(name: string, args: ServiceRoleArgs, opts?: pulumi.ResourceOptions);
}
