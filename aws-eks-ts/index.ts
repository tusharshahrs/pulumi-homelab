import * as eks from "@pulumi/eks";

// Create an EKS cluster with the default configuration.
const cluster = new eks.Cluster("my-ekscluster", {
    instanceType: "t3a.micro",
});

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;