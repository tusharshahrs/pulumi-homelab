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

const flashStorageClass = new k8s.storage.v1.StorageClass("flashStorageClass", {
    apiVersion: "storage.k8s.io/v1",
    kind: "StorageClass",
    metadata: {
        name: "flash",
    },
    provisioner: "kubernetes.io/aws-ebs",
    volumeBindingMode: "WaitForFirstConsumer",
    allowVolumeExpansion: true,
    parameters: {
        type: "gp2",
    },
}, { provider: k8sProvider });

const dullahanService = new k8s.core.v1.Service("dullahanService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "dullahan",
        labels: {
            app: "web",
        },
    },
    spec: {
        ports: [{
            port: 80,
            name: "web",
        }],
        clusterIP: "None",
        selector: {
            app: "web",
        },
    },
}, { provider: k8sProvider });

const webrootStatefulSet = new k8s.apps.v1.StatefulSet("webrootStatefulSet", {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
        name: "tkb-sts",
    },
    spec: {
        replicas: 3,
        selector: {
            matchLabels: {
                app: "web",
            },
        },
        serviceName: "dullahan",
        template: {
            metadata: {
                labels: {
                    app: "web",
                },
            },
            spec: {
                terminationGracePeriodSeconds: 10,
                containers: [{
                    name: "ctr-web",
                    image: "nginx:latest",
                    ports: [{
                        containerPort: 80,
                        name: "web",
                    }],
                    volumeMounts: [{
                        name: "webroot",
                        mountPath: "/usr/share/nginx/html",
                    }],
                }],
            },
        },
        volumeClaimTemplates: [{
            metadata: {
                name: "webroot",
            },
            spec: {
                accessModes: ["ReadWriteOnce"],
                storageClassName: "flash",
                resources: {
                    requests: {
                        storage: "5Gi",
                    },
                },
            },
        }],
    },
}, { provider: k8sProvider });

const jump_podPod = new k8s.core.v1.Pod("jump_podPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "jump-pod",
    },
    spec: {
        terminationGracePeriodSeconds: 1,
        containers: [{
            image: "nigelpoulton/curl:1.0",
            name: "jump-ctr",
            tty: true,
            stdin: true,
        }],
    },
}, { provider: k8sProvider });