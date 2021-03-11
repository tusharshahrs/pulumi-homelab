import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const useast2 = new aws.Provider("useast2", { region: "us-east-2" });

/* const projectName = pulumi.getProject();
 */// Create a new VPC.
/* const vpc = new awsx.ec2.Vpc(`${projectName}`, {
    
    tags: { "Name": `${projectName}` },
}, {provider: useast2}); */

// Create an EKS cluster with the default configuration.
 const cluster = new eks.Cluster("shaht-myekscluster", {
    instanceType: "t3a.micro",
    providerCredentialOpts: {profileName: aws.config.profile}  
}, {provider: useast2});

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;