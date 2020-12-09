import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

const devNamespace = new k8s.core.v1.Namespace("devNamespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "dev",
    },
}, { provider: k8sProvider });

const wordpress = new k8s.helm.v3.Chart("metrics-server", {
    version: "5.3.1",
    chart: "metrics-server",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
}, { provider: k8sProvider });
