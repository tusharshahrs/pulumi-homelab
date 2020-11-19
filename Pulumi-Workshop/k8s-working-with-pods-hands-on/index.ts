import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
//import * as eks from "@pulumi/eks";

import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

const hello_podPod = new k8s.core.v1.Pod("hello_podPod", {
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
}, { provider: k8sProvider });
