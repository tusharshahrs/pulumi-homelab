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

/* const pv1PersistentVolume = new k8s.core.v1.Pod("test_ebsPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "test-ebs",
    },
    spec: {
        containers: [{
            image: "k8s.gcr.io/test-webserver",
            name: "test-container",
            volumeMounts: [{
                mountPath: "/test-ebs",
                name: "test-volume",
            }],
        }],
        volumes: [{
            name: "test-volume",
            awsElasticBlockStore: {
                volumeID: "vol-0dcc98d2a53263e17",
                fsType: "ext4",
            },
        }],
    },
}, { provider: k8sProvider }); */


/* const pv1PersistentVolume2 = new k8s.core.v1.PersistentVolume("pv1PersistentVolume", {
    apiVersion: "v1",
    kind: "PersistentVolume",
    metadata: {
        name: "pv1",
        labels: {
            env: "book",
        },
    },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: "test",
        capacity: {
            storage: "10Gi",
        },
        persistentVolumeReclaimPolicy: "Retain",
        awsElasticBlockStore: {
            volumeID: "vol-0dcc98d2a53263e17",
        },
    },
}, { provider: k8sProvider }); */

/* const pvc1PersistentVolumeClaim = new k8s.core.v1.PersistentVolumeClaim("pvc1PersistentVolumeClaim", {
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
        name: "pvc1",
    },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: "test-volume",
        resources: {
            requests: {
                storage: "10Gi",
            },
        },
    },
}); */


/* const slowStorageClass = new k8s.storage.v1.StorageClass("slowStorageClass", {
    kind: "StorageClass",
    apiVersion: "storage.k8s.io/v1",
    metadata: {
        name: "slow",
        annotations: {
            "storageclass.kubernetes.io/is-default-class": "true",
        },
    },
    provisioner: "kubernetes.io/aws-ebs",
    parameters: {
        type: "gp2",
        zones: "us-east-2a",
        iopsPerGB: "10"
    },
    reclaimPolicy: "Retain",
}, { provider: k8sProvider });

const pv_ticketPersistentVolumeClaim = new k8s.core.v1.PersistentVolumeClaim("pv_ticketPersistentVolumeClaim", {
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
        name: "pv-ticket",
    },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: "slow",
        resources: {
            requests: {
                storage: "25Gi",
            },
        },
    },
}, { provider: k8sProvider });

const class_podPod = new k8s.core.v1.Pod("class_podPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "class-pod",
    },
    spec: {
        volumes: [{
            name: "data",
            persistentVolumeClaim: {
                claimName: "pv-ticket",
            },
        }],
        containers: [{
            name: "ubuntu-ctr",
            image: "ubuntu:latest",
            command: [
                "/bin/bash",
                "-c",
                "sleep 60m",
            ],
            volumeMounts: [{
                mountPath: "/data",
                name: "data",
            }],
        }],
    },
}, { provider: k8sProvider }); */




/* const fastStorageClass = new k8s.storage.v1.StorageClass("fastStorageClass", {
    kind: "StorageClass",
    apiVersion: "storage.k8s.io/v1",
    metadata: {
        name: "fast",
        annotations: {
            "storageclass.kubernetes.io/is-default-class": "true",
        },
    },
    provisioner: "kubernetes.io/aws-ebs",
    parameters: {
        type: "io2",
        zones: "us-east-2a",
        iopsPerGB: "10"
    },
    reclaimPolicy: "Retain",
}, { provider: k8sProvider });

const pv_ticketPersistentVolumeClaim = new k8s.core.v1.PersistentVolumeClaim("pv_ticketPersistentVolumeClaim", {
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
        name: "pv-ticket",
    },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: "fast",
        resources: {
            requests: {
                storage: "25Gi",
            },
        },
    },
}, { provider: k8sProvider });

const class_podPod = new k8s.core.v1.Pod("class_podPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "class-pod",
    },
    spec: {
        volumes: [{
            name: "data",
            persistentVolumeClaim: {
                claimName: "pv-ticket",
            },
        }],
        containers: [{
            name: "ubuntu-ctr",
            image: "ubuntu:latest",
            command: [
                "/bin/bash",
                "-c",
                "sleep 1m",
            ],
            volumeMounts: [{
                mountPath: "/data",
                name: "data",
            }],
        }],
    },
}, { provider: k8sProvider }); */

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
