import * as pulumi from "@pulumi/pulumi";
import {iam_policy_eks_cluster_autoscale, managedPolicyArns} from "./iam";

// Create IAM Roles and matching InstanceProfiles to use with the nodegroups.

export const my_policy = iam_policy_eks_cluster_autoscale;
export const my_managedPolicyArns = managedPolicyArns;