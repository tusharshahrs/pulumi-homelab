import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";
/* const config = new pulumi.Config();
const eksStack = new StackReference(config.require("eksclusterStack"));
const cluster = eksStack.getOutput("eks_cluster_name");
const kubeconfig = pulumi.secret(eksStack.getOutput("kubeconfig"));
const k8sProvider = eksStack.getOutput("k8sProvider");
const myproject = getProject(); */
//const myproject = projectName;
//const projectName = pulumi.getProject();
//const stackName = pulumi.getStack();

const namespace = new k8s.core.v1.Namespace(projectName, {
    metadata:
    {
        name: `${projectName}-ns`,
    }
}, { provider: k8sProvider });

const appLabels = { app: "nginx" };
const deployment = new k8s.apps.v1.Deployment("nginx-deployment", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 2,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});
export const namespacename = namespace.metadata.name;
export const deploymentname = deployment.metadata.name;