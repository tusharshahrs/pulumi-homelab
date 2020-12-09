import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

const metricsnamespace = new k8s.core.v1.Namespace("metrics-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "metrics",
    },
}, { provider: k8sProvider });

/* const apachechart = new k8s.helm.v3.Chart(
    "apache",
    {
        repo: "bitnami",
        chart: "apache",
        version: "3.0.0",
        fetchOpts: {
            repo: "https://charts.bitnami.com/bitnami",
        },
    },{ provider:k8sProvider }); */

/* const wordpress = new k8s.helm.v3.Chart("wpdev", {
    version: "10.0.7",
    chart: "wordpress",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
},{ provider:k8sProvider }); */

//https://github.com/bitnami/bitnami-docker-metrics-server
//https://artifacthub.io/packages/helm/bitnami/metrics-server
const metricsserver = new k8s.helm.v3.Chart(
    "metrics-server-helm3", 
    {
    version: "5.3.1",
    chart: "metrics-server",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
}, { provider: k8sProvider }); 
