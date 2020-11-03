import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as pulumi from "@pulumi/pulumi";
import { Config, getStack, StackReference } from "@pulumi/pulumi";
//const networkingStack = new StackReference(config.get("networkingStack"))
const config = new pulumi.Config();
const networkingStack = new StackReference(config.require("networkingStack"));
const vpc_id = networkingStack.getOutput("pulumi_vpc_id");
const vpc_privatesubnetids = networkingStack.getOutput("pulumi_vpc_private_subnet_ids");
const vpc_publicsubnetids = networkingStack.getOutput("pulumi_vpc_public_subnet_ids");
//const config = new pulumi.Config();
//vpc = config.
/* const vpc = new awsx.ec2.Vpc("shahteks-vpc", {
    numberOfAvailabilityZones: 3,
    numberOfNatGateways: 1,

}); */
const mytags = {"eks":"yes", "launched_by":"shaht","demo":"yes", "env":"dev"};

const cluster = new eks.Cluster("shahteks", 
{
    vpcId: vpc_id,
    privateSubnetIds: vpc_privatesubnetids,
    publicSubnetIds: vpc_publicsubnetids,
    minSize: 1,
    instanceType:"t3a.medium",
    //instanceType: "t4g.medium",
    tags: mytags,
});

//export const vpcId = vpc.id;
//export const vpcprivatesubnets = vpc.privateSubnetIds;
//export const vpcpublicsubnets = vpc.publicSubnetIds;
export const vpcid = vpc_id;
export const vpcprivatesubnets = vpc_privatesubnetids;
export const vpcpublicsubnets = vpc_publicsubnetids;
export const eks_cluster_name = cluster.eksCluster.name;
export const eks_cluster_arn = cluster.eksCluster.arn;
export const eks_cluster_version = cluster.eksCluster.version;
export const eks_cluster_platform_version = cluster.eksCluster.platformVersion;
export const eks_cluster_status = cluster.eksCluster.status;
//export const kubeconfig =  cluster.kubeconfig
export const kubeconfig =  pulumi.secret(cluster.kubeconfig);
export const k8sProvider = cluster.provider;