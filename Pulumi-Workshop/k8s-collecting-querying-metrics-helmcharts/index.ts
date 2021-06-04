import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, eks_cluster_name,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

const metricsnamespace = new k8s.core.v1.Namespace("metrics-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "metrics",
    },
}, { provider: k8sProvider });
