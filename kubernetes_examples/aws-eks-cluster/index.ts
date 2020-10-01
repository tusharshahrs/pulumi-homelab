import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import { Cluster } from "@pulumi/aws/cloudhsmv2";

//const config =  new pulumi.Config();
//const currentstackpath = config.get("mystackpath");
//const myvpc =  currentstackpath.get("pulumi_vpc_id");

const mynetwork = new pulumi.StackReference("shaht/crosswalk-vpc/myvpc");
const myvpc = mynetwork.requireOutput("pulumi_vpc_id");
const myprivatesubnets = mynetwork.requireOutput("pulumi_vpc_private_subnet_ids")
const mypublicsubnets = mynetwork.requireOutput("pulumi_vpc_public_subnet_ids")
//shaht/crosswalk-vpc/vpc-fargate-dev
//const cluster = new eks.Cluster(name)



const name = "shahteks";

// Create an EKS cluster with non-default configuration
const cluster = new eks.Cluster(name,
    {
    vpcId: myvpc,
    privateSubnetIds: myprivatesubnets,
    publicSubnetIds: mypublicsubnets,
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    instanceType: "t2.small",
    storageClasses: "gp2",
    deployDashboard: false,
    });

// additional_secret_outputs specify properties that must be encrypted as secrets
// https://www.pulumi.com/docs/intro/concepts/programming-model/#additionalsecretoutputs
//{ additionalSecretOutputs: [certificateAuthority]};

// Export the clusters' kubeconfig.

export const eksvpc = myvpc;
export const myprivate_subnets = myprivatesubnets;
export const eks_cluster_arn = cluster.eksCluster.arn;
export const kubeconfig = pulumi.secret(cluster.kubeconfig);