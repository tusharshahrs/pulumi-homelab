//import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as pulumi from "@pulumi/pulumi";
import { Config, getStack, getProject, StackReference } from "@pulumi/pulumi";
import * as iam from "./iam";

//const networkingStack = new StackReference(config.get("networkingStack"))
const config = new pulumi.Config();
const networkingStack = new StackReference(config.require("networkingStack"));
const vpc_id = networkingStack.getOutput("pulumi_vpc_id");
const vpc_privatesubnetids = networkingStack.getOutput("pulumi_vpc_private_subnet_ids");
const vpc_publicsubnetids = networkingStack.getOutput("pulumi_vpc_public_subnet_ids");
const projectName = getProject();
const stackName = getStack();

// Basic Tags
const mytags = {"eks":"yes","clustertags":"yes" ,"launched_by":"shaht","demo":"yes", "env":"dev", "projectName": projectName, "stackName": stackName,};
// eks cluster first part of name
const my_name = `shaht-eks`;

const cluster = new eks.Cluster("shahteks", 
{   
    vpcId: vpc_id,
    privateSubnetIds: vpc_privatesubnetids,
    publicSubnetIds: vpc_publicsubnetids,
    minSize: 1,
    instanceType:"t3a.small",
    tags: mytags,
    nodeRootVolumeSize: 10,
    encryptRootBockDevice: true,
    version: "1.18",
});

// Basic set of tags
const autoscaling_tags = {"pulumi":"eks","nodegroup":"yes", "autoscaling":"yes","selfservice":"no", "team": "engineering", "partner":"marketing", "projectName": projectName, "stackName": stackName,}
// Needed for cluster-autoscaler helm3 chart: https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler#auto-discovery
export const tag_cluster_autoscaler_enabled = {"k8s.io/cluster-autoscaler/enabled":"yes"};
// Needed for cluster-autoscaler helm3 chart: https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler#auto-discovery
export const tag_cluster_autoscaler_eks_name = pulumi.interpolate`k8s.io/cluster-autoscaler/${cluster.eksCluster.name}`;
// Creating the dictionary with cluster name and starts with k8s.io, cannot have it start with kubernetes.io
export const tag_cluster_autoscaler_autodiscovery = tag_cluster_autoscaler_eks_name.apply(cluster_autoscaler_autodiscovery_tag => {
    return JSON.parse(`{"${cluster_autoscaler_autodiscovery_tag}":"owned"}`);
});

// Combing all 3 tags into 1.
/*export const cluster_autoscale_tags = {
    ...autoscaling_tags,
    ...tag_cluster_autoscaler_enabled,
    ...tag_cluster_autoscaler_autodiscovery,
};*/

export const cluster_autoscale_tags = tag_cluster_autoscaler_autodiscovery.apply(tag_cluster_autoscaler_autodiscovery_updated_tag => {
    return {
    ...autoscaling_tags,
    ...tag_cluster_autoscaler_enabled,
    ...tag_cluster_autoscaler_autodiscovery_updated_tag,
    }
});

// Create 3 IAM Roles and matching InstanceProfiles to use with the nodegroups.
const roles = iam.createRoles(my_name, 1);
const instanceProfiles = iam.createInstanceProfiles(my_name, roles);

const ngstandard = new eks.NodeGroup(`${my_name}-ng`, {
    cluster: cluster,
    instanceType: "t3a.medium",
    instanceProfile: instanceProfiles[0],
    desiredCapacity: 3,
    minSize: 2,
    maxSize: 8,
    spotPrice: "0.05",
    labels: { "clusterType": "standard" },
    //kubeletExtraArgs: "--read-only-port 10255",
    encryptRootBockDevice: true,
    nodeRootVolumeSize: 10,
    //cloudFormationTags:autoscaling_tags,
    autoScalingGroupTags: cluster_autoscale_tags,
});

export const vpcid = vpc_id;
export const vpcprivatesubnets = vpc_privatesubnetids;
export const vpcpublicsubnets = vpc_publicsubnetids;
export const eks_cluster_name = cluster.eksCluster.name;
export const eks_cluster_arn = cluster.eksCluster.arn;
export const eks_cluster_version = cluster.eksCluster.version;
export const eks_cluster_platform_version = cluster.eksCluster.platformVersion;
export const eks_cluster_status = cluster.eksCluster.status;
export const kubeconfig =  cluster.kubeconfig
export const k8sProvider = cluster.provider;
export const eks_nodegroups_autoScalingGroupName = ngstandard.autoScalingGroupName;
export const eks_nodegroups_urn = ngstandard.urn;
export const eks_nodegroup_tags = ngstandard.cfnStack.tags;