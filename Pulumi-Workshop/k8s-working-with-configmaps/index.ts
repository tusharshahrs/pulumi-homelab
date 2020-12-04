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

const multimapConfigMap = new k8s.core.v1.ConfigMap("multimapConfigMap", {
    kind: "ConfigMap",
    apiVersion: "v1",
    metadata: {
        name: "multimap",
    },
    data: {
        given: "Nigel",
        family: "Smith",
    },
}, { provider: k8sProvider });

const test_confConfigMap = new k8s.core.v1.ConfigMap("test_confConfigMap", {
    kind: "ConfigMap",
    apiVersion: "v1",
    metadata: {
        name: "test-conf",
    },
    data: {
        "test.conf": `env = plex-test
    endpoint = 0.0.0.0:31001
    char = utf8
    vault = PLEX/test
    log-size = 512M
`,
    },
}, { provider: k8sProvider });

/* const envpodPod = new k8s.core.v1.Pod("envpodPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        labels: {
            chapter: "configmaps",
        },
        name: "envpod",
    },
    spec: {
        restartPolicy: "OnFailure",
        containers: [{
            name: "ctr1",
            image: "busybox",
            command: [
                "/bin/sh",
                "-c",
                `echo First name $(FIRSTNAME) last name $(LASTNAME)`,
            ],
            env: [
                {
                    name: "FIRSTNAME",
                    valueFrom: {
                        configMapKeyRef: {
                            name: "multimap",
                            key: "given",
                        },
                    },
                },
                {
                    name: "LASTNAME",
                    valueFrom: {
                        configMapKeyRef: {
                            name: "multimap",
                            key: "family",
                        },
                    },
                },
            ],
        }],
    },
}, { provider: k8sProvider }); */

const cmvolPod = new k8s.core.v1.Pod("cmvolPod", {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "cmvol",
    },
    spec: {
        volumes: [{
            name: "volmap",
            configMap: {
                name: "multimap",
            },
        }],
        containers: [{
            name: "ctr",
            image: "nginx",
            volumeMounts: [{
                name: "volmap",
                mountPath: "/etc/name",
            }],
        }],
    },
}, { provider: k8sProvider });