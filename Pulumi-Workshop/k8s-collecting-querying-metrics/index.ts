import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, eks_cluster_name,kubeconfig,k8sProvider,projectName,stackName, } from "./common";
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

const nginxnamespace = new k8s.core.v1.Namespace("nginx-Namespace", {
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
    version: "8.5.4",
    namespace: nginxnamespace.metadata.name,
    chart: "nginx",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
     values: {
              containerPorts: {https: 8443},
              autoscaling: {enabled: true, minReplicas: 1, maxReplicas: 5},
            },
}, { provider: k8sProvider });

const ingressnginxnamespace = new k8s.core.v1.Namespace("ingressnginx-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "ingress-nginx",
    },
}, { provider: k8sProvider });

//https://artifacthub.io/packages/helm/nginx/nginx-ingress
const ingressnginx = new k8s.helm.v3.Chart("ingressnginx", {
  namespace: ingressnginxnamespace.metadata.name,
  version: "0.8.0",
  chart: "nginx-ingress",
  fetchOpts: {
    repo: "https://helm.nginx.com/stable",
  },
  values: {
    //serviceaccount: { name: "nginx-ingress"},
    prometheus: { create: true },
    controller: {
      defaultTLS: { cert: {}, key: {}},
      config: {
          name: "nginx-config", 
          //annotations: {"proxy-protocol":"True","real-ip-header":"proxy-protocol","set-real-ip-from":"0.0.0.0/0"},
          //entries: ["nginx-ingress"],
          },
      ServiceAccount: { name: "nginx-ingress"},
      replicaCount: 1,
      service: {
        annotations: {            
          //"service.beta.kubernetes.io/aws-load-balancer-proxy-protocol": "*",
          "service.beta.kubernetes.io/aws-load-balancer-backend-protocol":"http",
          "service.beta.kubernetes.io/aws-load-balancer-ssl-ports": "https",
          "service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled":"true",
          "service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout":"60",
        },
      },
      //config: {entries: {"proxy-protocol": true, "real-ip-header":"proxy-protocol", "set-real-ip-from": "0.0.0.0/0"}},
    },
  },
});


// Values selected from: https://github.com/kubernetes/ingress-nginx/blob/master/charts/ingress-nginx/values.yaml
/*const ingressnginx = new k8s.helm.v3.Chart("ingressnginx",  {
    namespace: ingressnginxnamespace.metadata.name,
    version: "3.22.0",
    chart: "ingress-nginx",
    fetchOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx",
    },
    values: {
            controller: {   
                            // Deployment
                            annotations: {"kubernetes.io/ingress.class":"nginx"},
                            //replicaCount: 2, 
                            // Service needed for aws load balancers
                            service: {annotations:  {
                                                        //"service.beta.kubernetes.io/aws-load-balancer-proxy-protocol": "*",
                                                        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol": "http",
                                                        "service.beta.kubernetes.io/aws-load-balancer-ssl-ports": "https",
                                                        //"service.beta.kubernetes.io/aws-load-balancer-type": "nlb",
                                                        //"service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled":'true',
                                                        "service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout":'3600',
                                                    }
                                    },
                            //admissionWebhooks: {enabled: false},
                            //defaultBackend: {enabled: true},
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
}, { dependsOn: clusterautoscaler, provider: k8sProvider });
*/

/*
// Start of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/mandatory.yaml
const ingress_nginxNamespace = new k8s.core.v1.Namespace("ingress_nginxNamespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
}, { provider: k8sProvider });

// This was modified for Start of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/provider/aws/patch-configmap-l4.yaml
// Added:  data: {"use-proxy-protocol": "true", },
const ingress_nginxNginx_configurationConfigMap = new k8s.core.v1.ConfigMap("ingress_nginxNginx_configurationConfigMap", {
    kind: "ConfigMap",
    apiVersion: "v1",
    metadata: {
        name: "nginx-configuration",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    data: {
        "use-proxy-protocol": "true",
    },
}, { provider: k8sProvider });
// This was modified for End of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/provider/aws/patch-configmap-l4.yaml

const ingress_nginxTcp_servicesConfigMap = new k8s.core.v1.ConfigMap("ingress_nginxTcp_servicesConfigMap", {
    kind: "ConfigMap",
    apiVersion: "v1",
    metadata: {
        name: "tcp-services",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
}, { provider: k8sProvider });

const ingress_nginxUdp_servicesConfigMap = new k8s.core.v1.ConfigMap("ingress_nginxUdp_servicesConfigMap", {
    kind: "ConfigMap",
    apiVersion: "v1",
    metadata: {
        name: "udp-services",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
}, { provider: k8sProvider });

const ingress_nginxNginx_ingress_serviceaccountServiceAccount = new k8s.core.v1.ServiceAccount("ingress_nginxNginx_ingress_serviceaccountServiceAccount", {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
        name: "nginx-ingress-serviceaccount",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
}, { provider: k8sProvider });

const nginx_ingress_clusterroleClusterRole = new k8s.rbac.v1beta1.ClusterRole("nginx_ingress_clusterroleClusterRole", {
    apiVersion: "rbac.authorization.k8s.io/v1beta1",
    kind: "ClusterRole",
    metadata: {
        name: "nginx-ingress-clusterrole",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    rules: [
        {
            apiGroups: [""],
            resources: [
                "configmaps",
                "endpoints",
                "nodes",
                "pods",
                "secrets",
            ],
            verbs: [
                "list",
                "watch",
            ],
        },
        {
            apiGroups: [""],
            resources: ["nodes"],
            verbs: ["get"],
        },
        {
            apiGroups: [""],
            resources: ["services"],
            verbs: [
                "get",
                "list",
                "watch",
            ],
        },
        {
            apiGroups: ["extensions"],
            resources: ["ingresses"],
            verbs: [
                "get",
                "list",
                "watch",
            ],
        },
        {
            apiGroups: [""],
            resources: ["events"],
            verbs: [
                "create",
                "patch",
            ],
        },
        {
            apiGroups: ["extensions"],
            resources: ["ingresses/status"],
            verbs: ["update"],
        },
    ],
}, { provider: k8sProvider });

const ingress_nginxNginx_ingress_roleRole = new k8s.rbac.v1beta1.Role("ingress_nginxNginx_ingress_roleRole", {
    apiVersion: "rbac.authorization.k8s.io/v1beta1",
    kind: "Role",
    metadata: {
        name: "nginx-ingress-role",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    rules: [
        {
            apiGroups: [""],
            resources: [
                "configmaps",
                "pods",
                "secrets",
                "namespaces",
            ],
            verbs: ["get"],
        },
        {
            apiGroups: [""],
            resources: ["configmaps"],
            resourceNames: ["ingress-controller-leader-nginx"],
            verbs: [
                "get",
                "update",
            ],
        },
        {
            apiGroups: [""],
            resources: ["configmaps"],
            verbs: ["create"],
        },
        {
            apiGroups: [""],
            resources: ["endpoints"],
            verbs: ["get"],
        },
    ],
}, { provider: k8sProvider });

const ingress_nginxNginx_ingress_role_nisa_bindingRoleBinding = new k8s.rbac.v1beta1.RoleBinding("ingress_nginxNginx_ingress_role_nisa_bindingRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1beta1",
    kind: "RoleBinding",
    metadata: {
        name: "nginx-ingress-role-nisa-binding",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: "nginx-ingress-role",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "nginx-ingress-serviceaccount",
        namespace: "ingress-nginx",
    }],
}, { provider: k8sProvider });

const nginx_ingress_clusterrole_nisa_bindingClusterRoleBinding = new k8s.rbac.v1beta1.ClusterRoleBinding("nginx_ingress_clusterrole_nisa_bindingClusterRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1beta1",
    kind: "ClusterRoleBinding",
    metadata: {
        name: "nginx-ingress-clusterrole-nisa-binding",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "nginx-ingress-clusterrole",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "nginx-ingress-serviceaccount",
        namespace: "ingress-nginx",
    }],
}, { provider: k8sProvider });

const ingress_nginxNginx_ingress_controllerDeployment = new k8s.apps.v1.Deployment("ingress_nginxNginx_ingress_controllerDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: "nginx-ingress-controller",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                "app.kubernetes.io/name": "ingress-nginx",
                "app.kubernetes.io/part-of": "ingress-nginx",
            },
        },
        template: {
            metadata: {
                labels: {
                    "app.kubernetes.io/name": "ingress-nginx",
                    "app.kubernetes.io/part-of": "ingress-nginx",
                },
                annotations: {
                    "prometheus.io/port": "10254",
                    "prometheus.io/scrape": "true",
                },
            },
            spec: {
                serviceAccountName: "nginx-ingress-serviceaccount",
                containers: [{
                    name: "nginx-ingress-controller",
                    image: "quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.25.1",
                    args: [
                        "/nginx-ingress-controller",
                        `--configmap=$(POD_NAMESPACE)/nginx-configuration`,
                        `--tcp-services-configmap=$(POD_NAMESPACE)/tcp-services`,
                        `--udp-services-configmap=$(POD_NAMESPACE)/udp-services`,
                        `--publish-service=$(POD_NAMESPACE)/ingress-nginx`,
                        "--annotations-prefix=nginx.ingress.kubernetes.io",
                    ],
                    securityContext: {
                        allowPrivilegeEscalation: true,
                        capabilities: {
                            drop: ["ALL"],
                            add: ["NET_BIND_SERVICE"],
                        },
                        runAsUser: 33,
                    },
                    env: [
                        {
                            name: "POD_NAME",
                            valueFrom: {
                                fieldRef: {
                                    fieldPath: "metadata.name",
                                },
                            },
                        },
                        {
                            name: "POD_NAMESPACE",
                            valueFrom: {
                                fieldRef: {
                                    fieldPath: "metadata.namespace",
                                },
                            },
                        },
                    ],
                    ports: [
                        {
                            name: "http",
                            containerPort: 80,
                        },
                        {
                            name: "https",
                            containerPort: 443,
                        },
                    ],
                    livenessProbe: {
                        failureThreshold: 3,
                        httpGet: {
                            path: "/healthz",
                            port: 10254,
                            scheme: "HTTP",
                        },
                        initialDelaySeconds: 10,
                        periodSeconds: 10,
                        successThreshold: 1,
                        timeoutSeconds: 10,
                    },
                    readinessProbe: {
                        failureThreshold: 3,
                        httpGet: {
                            path: "/healthz",
                            port: 10254,
                            scheme: "HTTP",
                        },
                        periodSeconds: 10,
                        successThreshold: 1,
                        timeoutSeconds: 10,
                    },
                }],
            },
        },
    },
}, { provider: k8sProvider });
// End of // Start of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/mandatory.yaml


// Start of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/provider/aws/service-l4.yaml
const ingress_nginxIngress_nginxService = new k8s.core.v1.Service("ingress_nginxIngress_nginxService", {
    kind: "Service",
    apiVersion: "v1",
    metadata: {
        name: "ingress-nginx",
        namespace: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
        annotations: {
            "service.beta.kubernetes.io/aws-load-balancer-proxy-protocol": "*",
            "service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout": "60",
        },
    },
    spec: {
        type: "LoadBalancer",
        selector: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/part-of": "ingress-nginx",
        },
        ports: [
            {
                name: "http",
                port: 80,
                targetPort: "http",
            },
            {
                name: "https",
                port: 443,
                targetPort: "https",
            },
        ],
    },
}, { provider: k8sProvider });
// End of https://raw.githubusercontent.com/kubernetes/ingress-nginx/1cd17cd12c98563407ad03812aebac46ca4442f2/deploy/provider/aws/service-l4.yaml
*/
/*
//export const frontend_nginx_service_loadbalancer_hostname = pulumi.interpolate`"${ingress_nginxIngress_nginxService.status.loadBalancer.ingress[0].hostname}"`;
export const frontend_nginx_service_loadbalancer_hostname = pulumi.interpolate`${ingress_nginxIngress_nginxService.status.loadBalancer.ingress[0].hostname}`;
//export const frontend_ip_string = pulumi.interpolate`dig +short "${frontend_nginx_service_loadbalancer_hostname}" | tail -n 1`
export const prom_addr=pulumi.interpolate`mon.${frontend_nginx_service_loadbalancer_hostname}.nip.io`;
export const am_addr=pulumi.interpolate`alertmanager.${frontend_nginx_service_loadbalancer_hostname}.nip.io`;
*/


/*const prometheus = new k8s.helm.v3.Chart("prometheus",  {
    version: "13.3.1",
    namespace: metricsnamespace.metadata.name,
    chart: "prometheus",
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
     values: {
              //server: {ingress: {enabled: true, hosts: [frontend_nginx_service_loadbalancer_hostname]}},
              server: {ingress: {enabled: true, hosts: [prom_addr]}},
              //alertmanager: {ingress: { enabled: true, hosts: [frontend_nginx_service_loadbalancer_hostname]}},
              alertmanager: {ingress: { enabled: true, hosts: [am_addr]}},
            },
}, { provider: k8sProvider });*/

//export const prom_config = pulumi.interpolate`http://${prom_addr}/config`;
//export const prom_targets = pulumi.interpolate`http://${prom_addr}/target`;