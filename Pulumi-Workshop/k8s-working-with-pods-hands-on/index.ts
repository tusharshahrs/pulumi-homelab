import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

// Only Pods, no deployments or replica sets
/* const hello_podPod = new k8s.core.v1.Pod("hello_podPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "hello-pod",
        labels: {
            zone: "prod",
            version: "v1",
        },
    },
    spec: {
        containers: [{
            name: "hello-ctr",
            image: "nigelpoulton/k8sbook:latest",
            ports: [{
                containerPort: 8080,
            }],
        }],
    },
}, { provider: k8sProvider }); */

const hello_deployDeployment = new k8s.apps.v1.Deployment("hello_deployDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: "hello-deploy",
    },
    spec: {
        replicas: 5,
        selector: {
            matchLabels: {
                app: "hello-world",
            },
        },
        minReadySeconds: 10,
        strategy: {
            type: "RollingUpdate",
            rollingUpdate: {
                maxUnavailable: 1,
                maxSurge: 1,
            },
        },
        template: {
            metadata: {
                labels: {
                    app: "hello-world",
                },
            },
            spec: {
                containers: [{
                    name: "hello-pod",
                    image: "nigelpoulton/k8sbook:latest",
                    ports: [{
                        containerPort: 8080,
                    }],
                }],
            },
        },
    },
}, { provider: k8sProvider });

const hello_svcService = new k8s.core.v1.Service("hello_svcService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "hello-svc",
        labels: {
            app: "hello-world",
        },
    },
    spec: {
        type: "NodePort",
        ports: [{
            port: 8080,
            nodePort: 30001,
            protocol: "TCP",
        }],
        selector: {
            app: "hello-world",
        },
    },
}, { provider: k8sProvider });