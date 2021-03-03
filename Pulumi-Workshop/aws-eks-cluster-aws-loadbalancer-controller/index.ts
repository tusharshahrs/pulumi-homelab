import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";
import { eksStack, eks_cluster_name,kubeconfig,k8sProvider,projectName,stackName,region, vpc_id } from "./common";
import { version } from "process";

const metricsnamespace = new k8s.core.v1.Namespace("metrics-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "metrics",
    },
}, { provider: k8sProvider });

// URL of chart:  https://github.com/bitnami/bitnami-docker-metrics-server
// Helm Chart options: https://artifacthub.io/packages/helm/bitnami/metrics-server
// The values were picked from here: https://github.com/bitnami/charts/blob/master/bitnami/metrics-server/values.yaml
const metricsserver = new k8s.helm.v3.Chart("metricschart",  {
    version: "5.5.1",
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
    version: "9.4.0",
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

/*const nginxnamespace = new k8s.core.v1.Namespace("nginx-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "nginx",
    },
}, { provider: k8sProvider });

// https://artifacthub.io/packages/helm/bitnami/nginx
// chart options: https://github.com/bitnami/charts/tree/master/bitnami/nginx
// values.yaml: https://github.com/bitnami/charts/blob/master/bitnami/nginx/values.yaml
const nginxserver = new k8s.helm.v3.Chart("nginxchart",  {
    version: "8.5.5",
    namespace: nginxnamespace.metadata.name,
    chart: "nginx",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    values: {
        //ingress: {enabled: true, certManager: true},
    }
}, { provider: k8sProvider });
*/

const ingressnginxnamespace = new k8s.core.v1.Namespace("ngxiningress-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "nginx-ingress",
    },
}, { provider: k8sProvider });

// https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx
const ingressnginx = new k8s.helm.v3.Chart("ingressnginx",  {
    namespace: ingressnginxnamespace.metadata.name,
    version: "3.23.0",
    chart: "ingress-nginx",
    fetchOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx",
    },
    values: {
            controller: {   
                            // Deployment
                            annotations: {"kubernetes.io/ingress.class":"nginx"},
                            // Service needed for aws load balancers
                            service: {internal: {enabled: true},
                                      annotations:  {   
                                                        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol":"http",
                                                        "service.beta.kubernetes.io/aws-load-balancer-ssl-ports":"https",
                                                        "service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout":'75',
                                                        "service.beta.kubernetes.io/aws-load-balancer-proxy-protocol": "*",
                                                        "service.beta.kubernetes.io/aws-load-balancer-internal": "0.0.0.0/0",
                                                        "service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled":true,
                                                    }
                                    },
                            //admissionWebhooks: {port: 443}, 
                            defaultBackend: {enabled: true},
                            // enabled for prometheus
                            metrics: 
                            {
                                enabled: true,
                                service: 
                                    { annotations: {
                                        "prometheus.io/scrape":"true",
                                        "prometheus.io/port": "10254"
                                    }}
                                    
                            }
                        } 
    }
}, { provider: k8sProvider });

//https://artifacthub.io/packages/helm/aws/aws-load-balancer-controller
const awsloadbalancercontroller = new k8s.helm.v3.Chart("awslbcontroller",  {
    version: "1.1.5",
    namespace: "kube-system",
    chart: "aws-load-balancer-controller",
    fetchOpts: {
        repo: "https://aws.github.io/eks-charts",
    },
     values: {
              clusterName: eks_cluster_name,
              region: region,
              vpcId: vpc_id,
            },
}, { provider: k8sProvider });
