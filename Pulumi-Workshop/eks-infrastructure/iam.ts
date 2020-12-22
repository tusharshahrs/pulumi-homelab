import * as aws from "@pulumi/aws";
import * as iam from "./iam";
import * as pulumi from "@pulumi/pulumi";
import { StackReference } from "@pulumi/pulumi";
import { lambda } from "@pulumi/aws/types/enums";

const config = new pulumi.Config();
const autoscaleStack = new StackReference(config.require("autoscaleStack"));
const iam_policy_eks_cluster_autoscale = autoscaleStack.getOutput("iam_policy_eks_cluster_autoscale_arn");

let managedPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
];

iam_policy_eks_cluster_autoscale.apply(iam_policy_eks_cluster_autoscale => managedPolicyArns.push(iam_policy_eks_cluster_autoscale));

// Creates a role and attaches the EKS worker node IAM managed policies
export function createRole(name: string): aws.iam.Role {
    const role = new aws.iam.Role(`${name}-iamrole`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "ec2.amazonaws.com",
        }),
    });

    let counter = 0;
    for (const policy of managedPolicyArns) {
        // Create RolePolicyAttachment without returning it.
        const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
            { policyArn: policy, role: role },
        );
    }

    return role;
}

// Creates a collection of IAM roles.
export function createRoles(name: string, quantity: number): aws.iam.Role[] {
    const roles: aws.iam.Role[] = [];

    for (let i = 0; i < quantity; i++) {
        roles.push(iam.createRole(`${name}-role-${i}`));
    }

    return roles;
}

// Creates a collection of IAM instance profiles from the given roles.
export function createInstanceProfiles(name: string, roles: aws.iam.Role[]): aws.iam.InstanceProfile[] {
    const profiles: aws.iam.InstanceProfile[] = [];

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        profiles.push(new aws.iam.InstanceProfile(`${name}-instanceProfile-${i}`, {role: role}));
    }

    return profiles;
}