import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
//import * as iam from "./iam";

import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";
import * as eks from "@pulumi/eks";

//import { Cluster } from "@pulumi/aws/cloudhsmv2";

/* const config = new pulumi.Config();
const eksStack = new StackReference(config.require("eksclusterStack"));
const cluster = eksStack.getOutput("eks_cluster_name");
const kubeconfig = pulumi.secret(eksStack.getOutput("kubeconfig"));
const k8sProvider = eksStack.getOutput("k8sProvider");
const myproject = getProject(); */
//const myproject = projectName;
//const projectName = pulumi.getProject();
//const stackName = pulumi.getStack();

const namespace = new k8s.core.v1.Namespace(projectName, {
    metadata:
    {
        name: `${projectName}-ns`,
    }
}, { provider: k8sProvider });

const appLabels = { app: "nginx" };
const deployment = new k8s.apps.v1.Deployment("nginx-deployment", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 2,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
}, { provider: k8sProvider });

// Create 3 IAM Roles and matching InstanceProfiles to use with the nodegroups.
//const roles = iam.createRoles(projectName, 1);
//const instanceProfiles = iam.createInstanceProfiles(projectName, roles);

export const namespacename = namespace.metadata.name;
export const deploymentname = deployment.metadata.name;

/* const dbPod = new k8s.core.v1.Pod("dbPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "db",
        labels: {
            type: "db",
            vendor: "MongoLabs",
        },
    },
    spec: {
        containers: [{
            name: "mongodb",
            image: "mongo:3.3",
            command: ["mongod"],
            args: [
                "--rest",
                "--httpinterface",
            ],
        }],
    },
}, { provider: k8sProvider });

export const dbid = dbPod.id;
export const dbstatus = dbPod.status;
export const dbname = dbPod.metadata.name; */

/* const go_demo_2Pod = new k8s.core.v1.Pod("go_demo_2Pod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "go-demo-2",
        labels: {
            type: "stack",
        },
    },
    spec: {
        containers: [
            {
                name: "db",
                image: "mongo:3.3",
            },
            {
                name: "api",
                image: "vfarcic/go-demo-2",
                env: [{
                    name: "DB",
                    value: "localhost",
                }],
            },
        ],
    },
});

export const go_demo_2Pod_id = go_demo_2Pod.id;
export const go_demo_2Pod_status = go_demo_2Pod.status;
export const go_demo_2Pod_name = go_demo_2Pod.metadata.name; */

const go_demo_2ReplicaSet = new k8s.apps.v1.ReplicaSet("go_demo_2ReplicaSet", {
    apiVersion: "apps/v1",
    kind: "ReplicaSet",
    metadata: {
        name: "go-demo-2",
    },
    spec: {
        replicas: 4,
        selector: {
            matchLabels: {
                type: "backend",
                service: "go-demo-2",
            },
        },
        template: {
            metadata: {
                labels: {
                    type: "backend",
                    service: "go-demo-2",
                    db: "mongo",
                    language: "go",
                },
            },
            spec: {
                containers: [
                    {
                        name: "db",
                        image: "mongo:3.3",
                    },
                    {
                        name: "api",
                        image: "vfarcic/go-demo-2",
                        env: [{
                            name: "DB",
                            value: "localhost",
                        }],
                        livenessProbe: {
                            httpGet: {
                                path: "/demo/hello",
                                port: 8080,
                            },
                        },
                    },
                ],
            },
        },
    },
}, { provider: k8sProvider });