import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

//const useast2 = new aws.Provider("useast2", { region: "us-east-2" });

/* const projectName = pulumi.getProject();
 */// Create a new VPC.
/* const vpc = new awsx.ec2.Vpc(`${projectName}`, {
    
    tags: { "Name": `${projectName}` },
}, {provider: useast2}); */

// Create an EKS cluster with the default configuration.
 const cluster = new eks.Cluster("shaht-eks", {
    instanceType: "t3a.micro",
    version: "1.19",
    //providerCredentialOpts: {profileName: aws.config.profile}  
}//, 
//{provider: useast2}
);

const k8sProvider = cluster.provider;

const newrelicnamespace = new k8s.core.v1.Namespace("newrelic-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "newrelic",
    },
}, { provider: k8sProvider });

const newrelic = new k8s.helm.v3.Chart("nri-bundle",  {
    version: "2.10.4",
    namespace: newrelicnamespace.metadata.name,
    chart: "nri-bundle",
    fetchOpts: {
        repo: "https://helm-charts.newrelic.com/",
    },
    values: { 
              global: {cluster: cluster.eksCluster.name},
              kubeEvents: {enabled : true },
              prometheus: {enabled : true },
              logging: {enabled : true },
              kms: {enabled : true },

              },
}, { provider: k8sProvider });

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;
export const newrelicnamespace_name = newrelicnamespace.metadata.name;