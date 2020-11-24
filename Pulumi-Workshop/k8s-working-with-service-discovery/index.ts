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

const prodNamespace = new k8s.core.v1.Namespace("prodNamespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "prod",
    },
}, { provider: k8sProvider });

const devEnterpriseDeployment = new k8s.apps.v1.Deployment("devEnterpriseDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: "enterprise",
        labels: {
            app: "enterprise",
        },
        namespace: "dev",
    },
    spec: {
        selector: {
            matchLabels: {
                app: "enterprise",
            },
        },
        replicas: 2,
        strategy: {
            type: "RollingUpdate",
        },
        template: {
            metadata: {
                labels: {
                    app: "enterprise",
                },
            },
            spec: {
                terminationGracePeriodSeconds: 1,
                containers: [{
                    image: "nigelpoulton/k8sbook:text-dev",
                    name: "enterprise-ctr",
                    ports: [{
                        containerPort: 8080,
                    }],
                }],
            },
        },
    },
}, { provider: k8sProvider });
const prodEnterpriseDeployment = new k8s.apps.v1.Deployment("prodEnterpriseDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: "enterprise",
        labels: {
            app: "enterprise",
        },
        namespace: "prod",
    },
    spec: {
        selector: {
            matchLabels: {
                app: "enterprise",
            },
        },
        replicas: 2,
        strategy: {
            type: "RollingUpdate",
        },
        template: {
            metadata: {
                labels: {
                    app: "enterprise",
                },
            },
            spec: {
                terminationGracePeriodSeconds: 1,
                containers: [{
                    image: "nigelpoulton/k8sbook:text-prod",
                    name: "enterprise-ctr",
                    ports: [{
                        containerPort: 8080,
                    }],
                }],
            },
        },
    },
}, { provider: k8sProvider });

const devEntService = new k8s.core.v1.Service("devEntService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "ent",
        namespace: "dev",
    },
    spec: {
        selector: {
            app: "enterprise",
        },
        ports: [{
            port: 8080,
        }],
        type: "ClusterIP",
    },
}, { provider: k8sProvider });

const prodEntService = new k8s.core.v1.Service("prodEntService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "ent",
        namespace: "prod",
    },
    spec: {
        selector: {
            app: "enterprise",
        },
        ports: [{
            port: 8080,
        }],
        type: "ClusterIP",
    },
}, { provider: k8sProvider });

const devJumpPod = new k8s.core.v1.Pod("devJumpPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "jump",
        namespace: "dev",
    },
    spec: {
        terminationGracePeriodSeconds: 5,
        containers: [{
            name: "jump",
            image: "ubuntu",
            tty: true,
            stdin: true,
        }],
    },
}, { provider: k8sProvider });