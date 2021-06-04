import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, eks_cluster_name,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

const metricsnamespace = new k8s.core.v1.Namespace("metrics-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "metrics-ns",
    },
}, { provider: k8sProvider });


// URL of chart:  https://github.com/bitnami/bitnami-docker-metrics-server
// Helm Chart options: https://artifacthub.io/packages/helm/bitnami/metrics-server
// The values were picked from here: https://github.com/bitnami/charts/blob/master/bitnami/metrics-server/values.yaml
const metricsserver = new k8s.helm.v3.Chart("metricschart",  {
    version: "5.8.8",
    namespace: metricsnamespace.metadata.name,
    chart: "metrics-server",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    values: { 
              rbac: {create: true},
              apiService: {create: true},
            },
}, { provider: k8sProvider });

export const tag_cluster_autoscaler_enabled_label = '"k8s.io/cluster-autoscaler/enabled"';
export const my_eks_cluster_name = eks_cluster_name;

export const tag_cluster_autoscaler_eks_name = pulumi.interpolate`k8s.io/cluster-autoscaler/${eks_cluster_name}`;
export const tag_cluster_autoscaler_autodiscovery_label = tag_cluster_autoscaler_eks_name.apply(myekspart => {
    return JSON.stringify(`${myekspart}`);
  });

  // helm3 chart: https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler
// https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md
// autodiscovery: https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler#aws---using-auto-discovery-of-tagged-instance-groups
// extra args: https://docs.aws.amazon.com/eks/latest/userguide/cluster-autoscaler.html
const clusterautoscaler = new k8s.helm.v3.Chart("autoscale",  {
    version: "9.9.2",
    namespace: "kube-system",
    chart: "cluster-autoscaler",
    fetchOpts: {
        repo: "https://kubernetes.github.io/autoscaler",
    },
     values: {
              rbac: {create:true},
              extraArgs: {"stderrthreshold":"info","skip-nodes-with-local-storage":false,"expander":"least-waste","balance-similar-node-groups":true,"skip-nodes-with-system-pods":false,},
              autoDiscovery: {clusterName: eks_cluster_name, tags: [tag_cluster_autoscaler_enabled_label,tag_cluster_autoscaler_autodiscovery_label]},
            },
}, { provider: k8sProvider });

const nginxnamespace = new k8s.core.v1.Namespace("nginx-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "nginxingress-ns",
    },
}, { provider: k8sProvider });