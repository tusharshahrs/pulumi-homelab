import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as pulumi from "@pulumi/pulumi";


const vpc = new awsx.ec2.Vpc("workshop-vpc", {});

const cluster = new eks.Cluster("eks", 
{
    vpcId: vpc.id,
    privateSubnetIds: vpc.privateSubnetIds,
    publicSubnetIds: vpc.publicSubnetIds,
});

export const vpcId = vpc.id;
export const vpcprivatesubnets = vpc.privateSubnetIds;
export const vpcpublicsubnets = vpc.publicSubnetIds;
export const eks_cluster_name = cluster.eksCluster.name;
export const eks_cluster_arn = cluster.eksCluster.arn;
export const eks_cluster_version = cluster.eksCluster.version;
export const eks_cluster_platform_version = cluster.eksCluster.platformVersion;
export const eks_cluster_status = cluster.eksCluster.status;
//export const kubeconfig =  pulumi.secret(cluster.kubeconfig)
export const kubeconfig =  cluster.kubeconfig;