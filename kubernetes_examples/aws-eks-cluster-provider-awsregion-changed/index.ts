import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

//const config =  new pulumi.Config();
//const currentstackpath = config.get("mystackpath");
//const myvpc =  currentstackpath.get("pulumi_vpc_id");

// Create an AWS provider for the us-east-2 ohio region.
let aws = require("@pulumi/aws");
const myregion = "us-east-2"
let useast2 = new aws.Provider("useast2", { region: myregion });
//let useast2 = new aws.Provider("useast2", { region: "us-east-2" });

const mynetwork = new pulumi.StackReference("shaht/crosswalk-vpc/myvpc");
const myvpc = mynetwork.requireOutput("pulumi_vpc_id");
const myprivatesubnets = mynetwork.requireOutput("pulumi_vpc_private_subnet_ids")
//shaht/crosswalk-vpc/vpc-fargate-dev

const name = "shahteks";

// Create an EKS cluster with non-default configuration
//const vpc = new awsx.ec2.Vpc("vpc", { subnets: [{ type: "public" }] });
const cluster = new eks.Cluster(name, {
vpcId: myvpc,
    //subnetIds: vpc.publicSubnetIds,
    subnetIds: myprivatesubnets,
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    storageClasses: "gp2",
    deployDashboard: false,
}, { providers: {aws: useast2} });

// Export the clusters' kubeconfig.
export const eksvpc = myvpc;
export const myprivate_subnets = myprivatesubnets;
export const kubeconfig = cluster.kubeconfig;