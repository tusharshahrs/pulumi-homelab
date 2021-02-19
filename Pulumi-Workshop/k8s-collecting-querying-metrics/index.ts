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
              //autoscaling: {enabled: true, minReplicas: 1, maxReplicas: 5},
            },
}, { provider: k8sProvider });


//https://artifacthub.io/packages/helm/nginx/nginx-ingress
/*const ingressnginx = new k8s.helm.v3.Chart("ingressnginx", {
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
*/

// https://kubernetes.github.io/ingress-nginx/deploy/#aws
// Converted from: https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/aws/deploy.yaml
const ingress_nginxNamespace = new k8s.core.v1.Namespace("ingress_nginxNamespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "ingress-nginx",
        labels: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
        },
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/controller-serviceaccount.yaml
const ingress_nginxIngress_nginxServiceAccount = new k8s.core.v1.ServiceAccount("ingress_nginxIngress_nginxServiceAccount", {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx",
        namespace: "ingress-nginx",
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/controller-configmap.yaml
const ingress_nginxIngress_nginx_controllerConfigMap = new k8s.core.v1.ConfigMap("ingress_nginxIngress_nginx_controllerConfigMap", {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx-controller",
        namespace: "ingress-nginx",
    },
},{ provider: k8sProvider });


// Source: ingress-nginx/templates/clusterrole.yaml
const ingress_nginxClusterRole = new k8s.rbac.v1.ClusterRole("ingress_nginxClusterRole", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRole",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
        },
        name: "ingress-nginx",
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
            apiGroups: [
                "extensions",
                "networking.k8s.io",
            ],
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
            apiGroups: [
                "extensions",
                "networking.k8s.io",
            ],
            resources: ["ingresses/status"],
            verbs: ["update"],
        },
        {
            apiGroups: ["networking.k8s.io"],
            resources: ["ingressclasses"],
            verbs: [
                "get",
                "list",
                "watch",
            ],
        },
    ],
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/clusterrolebinding.yaml
const ingress_nginxClusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding("ingress_nginxClusterRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRoleBinding",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
        },
        name: "ingress-nginx",
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "ingress-nginx",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "ingress-nginx",
        namespace: "ingress-nginx",
    }],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/controller-role.yaml
const ingress_nginxIngress_nginxRole = new k8s.rbac.v1.Role("ingress_nginxIngress_nginxRole", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx",
        namespace: "ingress-nginx",
    },
    rules: [
        {
            apiGroups: [""],
            resources: ["namespaces"],
            verbs: ["get"],
        },
        {
            apiGroups: [""],
            resources: [
                "configmaps",
                "pods",
                "secrets",
                "endpoints",
            ],
            verbs: [
                "get",
                "list",
                "watch",
            ],
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
            apiGroups: [
                "extensions",
                "networking.k8s.io",
            ],
            resources: ["ingresses"],
            verbs: [
                "get",
                "list",
                "watch",
            ],
        },
        {
            apiGroups: [
                "extensions",
                "networking.k8s.io",
            ],
            resources: ["ingresses/status"],
            verbs: ["update"],
        },
        {
            apiGroups: ["networking.k8s.io"],
            resources: ["ingressclasses"],
            verbs: [
                "get",
                "list",
                "watch",
            ],
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
            resources: ["events"],
            verbs: [
                "create",
                "patch",
            ],
        },
    ],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/controller-rolebinding.yaml
const ingress_nginxIngress_nginxRoleBinding = new k8s.rbac.v1.RoleBinding("ingress_nginxIngress_nginxRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx",
        namespace: "ingress-nginx",
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: "ingress-nginx",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "ingress-nginx",
        namespace: "ingress-nginx",
    }],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/controller-service-webhook.yaml
const ingress_nginxIngress_nginx_controller_admissionService = new k8s.core.v1.Service("ingress_nginxIngress_nginx_controller_admissionService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx-controller-admission",
        namespace: "ingress-nginx",
    },
    spec: {
        type: "ClusterIP",
        ports: [{
            name: "https-webhook",
            port: 443,
            targetPort: "webhook",
        }],
        selector: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/component": "controller",
        },
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/controller-service.yaml
const ingress_nginxIngress_nginx_controllerService = new k8s.core.v1.Service("ingress_nginxIngress_nginx_controllerService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        annotations: {
            "service.beta.kubernetes.io/aws-load-balancer-backend-protocol": "tcp",
            "service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled": "true",
            "service.beta.kubernetes.io/aws-load-balancer-type": "nlb",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx-controller",
        namespace: "ingress-nginx",
    },
    spec: {
        type: "LoadBalancer",
        externalTrafficPolicy: "Local",
        ports: [
            {
                name: "http",
                port: 80,
                protocol: "TCP",
                targetPort: "http",
            },
            {
                name: "https",
                port: 443,
                protocol: "TCP",
                targetPort: "https",
            },
        ],
        selector: {
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/component": "controller",
        },
    },
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/controller-deployment.yaml
const ingress_nginxIngress_nginx_controllerDeployment = new k8s.apps.v1.Deployment("ingress_nginxIngress_nginx_controllerDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "controller",
        },
        name: "ingress-nginx-controller",
        namespace: "ingress-nginx",
    },
    spec: {
        selector: {
            matchLabels: {
                "app.kubernetes.io/name": "ingress-nginx",
                "app.kubernetes.io/instance": "ingress-nginx",
                "app.kubernetes.io/component": "controller",
            },
        },
        revisionHistoryLimit: 10,
        minReadySeconds: 0,
        template: {
            metadata: {
                labels: {
                    "app.kubernetes.io/name": "ingress-nginx",
                    "app.kubernetes.io/instance": "ingress-nginx",
                    "app.kubernetes.io/component": "controller",
                },
            },
            spec: {
                dnsPolicy: "ClusterFirst",
                containers: [{
                    name: "controller",
                    image: "k8s.gcr.io/ingress-nginx/controller:v0.44.0@sha256:3dd0fac48073beaca2d67a78c746c7593f9c575168a17139a9955a82c63c4b9a",
                    imagePullPolicy: "IfNotPresent",
                    lifecycle: {
                        preStop: {
                            exec: {
                                command: ["/wait-shutdown"],
                            },
                        },
                    },
                    args: [
                        "/nginx-ingress-controller",
                        `--publish-service=$(POD_NAMESPACE)/ingress-nginx-controller`,
                        "--election-id=ingress-controller-leader",
                        "--ingress-class=nginx",
                        `--configmap=$(POD_NAMESPACE)/ingress-nginx-controller`,
                        "--validating-webhook=:8443",
                        "--validating-webhook-certificate=/usr/local/certificates/cert",
                        "--validating-webhook-key=/usr/local/certificates/key",
                    ],
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                            add: ["NET_BIND_SERVICE"],
                        },
                        runAsUser: 101,
                        allowPrivilegeEscalation: true,
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
                        {
                            name: "LD_PRELOAD",
                            value: "/usr/local/lib/libmimalloc.so",
                        },
                    ],
                    livenessProbe: {
                        httpGet: {
                            path: "/healthz",
                            port: 10254,
                            scheme: "HTTP",
                        },
                        initialDelaySeconds: 10,
                        periodSeconds: 10,
                        timeoutSeconds: 1,
                        successThreshold: 1,
                        failureThreshold: 5,
                    },
                    readinessProbe: {
                        httpGet: {
                            path: "/healthz",
                            port: 10254,
                            scheme: "HTTP",
                        },
                        initialDelaySeconds: 10,
                        periodSeconds: 10,
                        timeoutSeconds: 1,
                        successThreshold: 1,
                        failureThreshold: 3,
                    },
                    ports: [
                        {
                            name: "http",
                            containerPort: 80,
                            protocol: "TCP",
                        },
                        {
                            name: "https",
                            containerPort: 443,
                            protocol: "TCP",
                        },
                        {
                            name: "webhook",
                            containerPort: 8443,
                            protocol: "TCP",
                        },
                    ],
                    volumeMounts: [{
                        name: "webhook-cert",
                        mountPath: "/usr/local/certificates/",
                        readOnly: true,
                    }],
                    resources: {
                        requests: {
                            cpu: "100m",
                            memory: "90Mi",
                        },
                    },
                }],
                nodeSelector: {
                    "kubernetes.io/os": "linux",
                },
                serviceAccountName: "ingress-nginx",
                terminationGracePeriodSeconds: 300,
                volumes: [{
                    name: "webhook-cert",
                    secret: {
                        secretName: "ingress-nginx-admission",
                    },
                }],
            },
        },
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/admission-webhooks/validating-webhook.yaml
//# before changing this value, check the required kubernetes version
//# https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#prerequisites
const ingress_nginx_admissionValidatingWebhookConfiguration = new k8s.admissionregistration.v1.ValidatingWebhookConfiguration("ingress_nginx_admissionValidatingWebhookConfiguration", {
    apiVersion: "admissionregistration.k8s.io/v1",
    kind: "ValidatingWebhookConfiguration",
    metadata: {
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        name: "ingress-nginx-admission",
    },
    webhooks: [{
        name: "validate.nginx.ingress.kubernetes.io",
        matchPolicy: "Equivalent",
        rules: [{
            apiGroups: ["networking.k8s.io"],
            apiVersions: ["v1beta1"],
            operations: [
                "CREATE",
                "UPDATE",
            ],
            resources: ["ingresses"],
        }],
        failurePolicy: "Fail",
        sideEffects: "None",
        admissionReviewVersions: [
            "v1",
            "v1beta1",
        ],
        clientConfig: {
            service: {
                namespace: "ingress-nginx",
                name: "ingress-nginx-controller-admission",
                path: "/networking/v1beta1/ingresses",
            },
        },
    }],
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/admission-webhooks/job-patch/serviceaccount.yaml
const ingress_nginxIngress_nginx_admissionServiceAccount = new k8s.core.v1.ServiceAccount("ingress_nginxIngress_nginx_admissionServiceAccount", {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
        name: "ingress-nginx-admission",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade,post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        namespace: "ingress-nginx",
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/admission-webhooks/job-patch/clusterrole.yaml
const ingress_nginx_admissionClusterRole = new k8s.rbac.v1.ClusterRole("ingress_nginx_admissionClusterRole", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRole",
    metadata: {
        name: "ingress-nginx-admission",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade,post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
    },
    rules: [{
        apiGroups: ["admissionregistration.k8s.io"],
        resources: ["validatingwebhookconfigurations"],
        verbs: [
            "get",
            "update",
        ],
    }],
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/admission-webhooks/job-patch/clusterrolebinding.yaml
const ingress_nginx_admissionClusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding("ingress_nginx_admissionClusterRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRoleBinding",
    metadata: {
        name: "ingress-nginx-admission",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade,post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "ingress-nginx-admission",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "ingress-nginx-admission",
        namespace: "ingress-nginx",
    }],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/admission-webhooks/job-patch/role.yaml
const ingress_nginxIngress_nginx_admissionRole = new k8s.rbac.v1.Role("ingress_nginxIngress_nginx_admissionRole", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
        name: "ingress-nginx-admission",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade,post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        namespace: "ingress-nginx",
    },
    rules: [{
        apiGroups: [""],
        resources: ["secrets"],
        verbs: [
            "get",
            "create",
        ],
    }],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/admission-webhooks/job-patch/rolebinding.yaml
const ingress_nginxIngress_nginx_admissionRoleBinding = new k8s.rbac.v1.RoleBinding("ingress_nginxIngress_nginx_admissionRoleBinding", {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: {
        name: "ingress-nginx-admission",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade,post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        namespace: "ingress-nginx",
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: "ingress-nginx-admission",
    },
    subjects: [{
        kind: "ServiceAccount",
        name: "ingress-nginx-admission",
        namespace: "ingress-nginx",
    }],
},{ provider: k8sProvider });

// # Source: ingress-nginx/templates/admission-webhooks/job-patch/job-createSecret.yaml
const ingress_nginxIngress_nginx_admission_createJob = new k8s.batch.v1.Job("ingress_nginxIngress_nginx_admission_createJob", {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
        name: "ingress-nginx-admission-create",
        annotations: {
            "helm.sh/hook": "pre-install,pre-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        namespace: "ingress-nginx",
    },
    spec: {
        template: {
            metadata: {
                name: "ingress-nginx-admission-create",
                labels: {
                    "helm.sh/chart": "ingress-nginx-3.23.0",
                    "app.kubernetes.io/name": "ingress-nginx",
                    "app.kubernetes.io/instance": "ingress-nginx",
                    "app.kubernetes.io/version": "0.44.0",
                    "app.kubernetes.io/managed-by": "Helm",
                    "app.kubernetes.io/component": "admission-webhook",
                },
            },
            spec: {
                containers: [{
                    name: "create",
                    image: "docker.io/jettech/kube-webhook-certgen:v1.5.1",
                    imagePullPolicy: "IfNotPresent",
                    args: [
                        "create",
                        `--host=ingress-nginx-controller-admission,ingress-nginx-controller-admission.$(POD_NAMESPACE).svc`,
                        `--namespace=$(POD_NAMESPACE)`,
                        "--secret-name=ingress-nginx-admission",
                    ],
                    env: [{
                        name: "POD_NAMESPACE",
                        valueFrom: {
                            fieldRef: {
                                fieldPath: "metadata.namespace",
                            },
                        },
                    }],
                }],
                restartPolicy: "OnFailure",
                serviceAccountName: "ingress-nginx-admission",
                securityContext: {
                    runAsNonRoot: true,
                    runAsUser: 2000,
                },
            },
        },
    },
},{ provider: k8sProvider });

//# Source: ingress-nginx/templates/admission-webhooks/job-patch/job-patchWebhook.yaml
const ingress_nginxIngress_nginx_admission_patchJob = new k8s.batch.v1.Job("ingress_nginxIngress_nginx_admission_patchJob", {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
        name: "ingress-nginx-admission-patch",
        annotations: {
            "helm.sh/hook": "post-install,post-upgrade",
            "helm.sh/hook-delete-policy": "before-hook-creation,hook-succeeded",
        },
        labels: {
            "helm.sh/chart": "ingress-nginx-3.23.0",
            "app.kubernetes.io/name": "ingress-nginx",
            "app.kubernetes.io/instance": "ingress-nginx",
            "app.kubernetes.io/version": "0.44.0",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/component": "admission-webhook",
        },
        namespace: "ingress-nginx",
    },
    spec: {
        template: {
            metadata: {
                name: "ingress-nginx-admission-patch",
                labels: {
                    "helm.sh/chart": "ingress-nginx-3.23.0",
                    "app.kubernetes.io/name": "ingress-nginx",
                    "app.kubernetes.io/instance": "ingress-nginx",
                    "app.kubernetes.io/version": "0.44.0",
                    "app.kubernetes.io/managed-by": "Helm",
                    "app.kubernetes.io/component": "admission-webhook",
                },
            },
            spec: {
                containers: [{
                    name: "patch",
                    image: "docker.io/jettech/kube-webhook-certgen:v1.5.1",
                    imagePullPolicy: "IfNotPresent",
                    args: [
                        "patch",
                        "--webhook-name=ingress-nginx-admission",
                        `--namespace=$(POD_NAMESPACE)`,
                        "--patch-mutating=false",
                        "--secret-name=ingress-nginx-admission",
                        "--patch-failure-policy=Fail",
                    ],
                    env: [{
                        name: "POD_NAMESPACE",
                        valueFrom: {
                            fieldRef: {
                                fieldPath: "metadata.namespace",
                            },
                        },
                    }],
                }],
                restartPolicy: "OnFailure",
                serviceAccountName: "ingress-nginx-admission",
                securityContext: {
                    runAsNonRoot: true,
                    runAsUser: 2000,
                },
            },
        },
    },
},{ provider: k8sProvider });

// Values selected from: https://github.com/kubernetes/ingress-nginx/blob/master/charts/ingress-nginx/values.yaml
/*const ingressnginx = new k8s.helm.v3.Chart("ingressnginx",  {
    namespace: ingressnginxnamespace.metadata.name,
    version: "3.23.0",
    chart: "ingress-nginx",
    fetchOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx",
    },
    values: {
            controller: {   
                            // Deployment
                            //annotations: {"kubernetes.io/ingress.class":"nginx"},
                            //replicaCount: 2, 
                            // Service needed for aws load balancers
                            service: {annotations:  {
                                                        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol": "tcp",
                                                        "service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled":"true",
                                                        "service.beta.kubernetes.io/aws-load-balancer-type":"nlb",
                                                        //"service.beta.kubernetes.io/aws-load-balancer-backend-protocol":"http",
                                                        //"service.beta.kubernetes.io/aws-load-balancer-ssl-ports":"https",
                                                        //"service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout":'3600'
                                                    }
                                    },
                            admissionWebhooks: {port: 443},
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
}, { dependsOn: clusterautoscaler, provider: k8sProvider });
*/


//export const frontend_nginx_service_loadbalancer_hostname = pulumi.interpolate`"${ingress_nginxIngress_nginxService.status.loadBalancer.ingress[0].hostname}"`;
export const frontend_nginx_service_loadbalancer_hostname = pulumi.interpolate`${ingress_nginxIngress_nginx_controllerService.status.loadBalancer.ingress[0].hostname}`;
//export const frontend_ip_string = pulumi.interpolate`dig +short "${frontend_nginx_service_loadbalancer_hostname}" | tail -n 1`
export const prom_addr=pulumi.interpolate`mon.${frontend_nginx_service_loadbalancer_hostname}.nip.io`;
export const am_addr=pulumi.interpolate`alertmanager.${frontend_nginx_service_loadbalancer_hostname}.nip.io`;

// installing this first before prometheus
const kubestatemetrics = new k8s.helm.v3.Chart("kubestatemetrics",  {
    version: "1.2.1",
    namespace: metricsnamespace.metadata.name,
    chart: "kube-state-metrics",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    }, 

}, { provider: k8sProvider });

const prometheus = new k8s.helm.v3.Chart("prometheus",  {
    version: "13.3.2",
    namespace: metricsnamespace.metadata.name,
    chart: "prometheus",
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
}, { provider: k8sProvider });


/*const kubeprometheusstack = new k8s.helm.v3.Chart("kubeprometheusstack",  {
    version: "13.10.0",
    namespace: metricsnamespace.metadata.name,
    chart: "kube-prometheus-stack",
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    }, 

}, { provider: k8sProvider });*/

/*const prometheus = new k8s.helm.v3.Chart("prometheus",  {
    version: "13.3.2",
    namespace: metricsnamespace.metadata.name,
    chart: "prometheus",
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
     values: {
              server: {
                       ingress: 
                            { enabled: true, 
                              hosts: [prom_addr], 
                              annotations: {
                                              "kubernetes.io/ingress.class": "nginx",
                                              "kubernetes.io/tls-acme": "true",
                                            "ingress.kubernetes.io/ssl-redirect":"false", 
                                            "nginx.ingress.kubernetes.io/ssl-redirect": "false"
                                           }
                            },
                       resources: { 
                                   limits: {cpu: "10m", memory: "50Mi"},
                                   requests: { cpu: "10m", memory: "50Mi"}
                                  }
                       
                      },
              alertmanager: {
                        ingress: { 
                                  enabled: true, hosts: [am_addr]},
                                  annotations: {
                                                "ingress.kubernetes.io/ssl-redirect":"false",
                                                "nginx.ingress.kubernetes.io/ssl-redirect":"false"
                                               }
                                 },
                        resources: { 
                                    limits:   {cpu: "10m", memory: "20Mi"},
                                    requests: { cpu: "5m", memory: "10Mi"}
                                   },
              nodeExporter: { 
                resources: { 
                    limits:   {cpu: "10m", memory: "20Mi"},
                    requests: { cpu: "5m", memory: "10Mi"}
                   },
              },
              pushgateway: {
                resources: { 
                    limits:   {cpu: "10m", memory: "20Mi"},
                    requests: { cpu: "5m", memory: "10Mi"}
                   },
              },
              //kubeStateMetrics
            },
}, { provider: k8sProvider });
*/

//export const prom_config = pulumi.interpolate`http://${prom_addr}/config`;
//export const prom_targets = pulumi.interpolate`http://${prom_addr}/target`;