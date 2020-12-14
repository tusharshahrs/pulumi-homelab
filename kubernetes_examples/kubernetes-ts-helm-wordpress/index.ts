// Copyright 2016-2020, Pulumi Corporation.  All rights reserved.

import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";

// Create an EKS cluster with the default configuration.
const cluster = new eks.Cluster("shaht-my-cluster");

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;

const wordpressns = new k8s.core.v1.Namespace("wordpress-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "wordpress-ns",
    },
}, { provider: cluster.provider });

// Deploy the bitnami/wordpress chart.
 const wordpress = new k8s.helm.v3.Chart("wpdev", {
    namespace: wordpressns.metadata.name,
    version: "10.0.3",
    chart: "wordpress",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
}, { provider: cluster.provider });

// Get the status field from the wordpress service, and then grab a reference to the ingress field.
//const frontend = wordpress.getResourceProperty("v1/Service", "wpdev-wordpress","status");
const frontend = wordpress.getResourceProperty("v1/Service", "wordpress-ns/wpdev-wordpress","status");
const ingress = frontend.loadBalancer.ingress[0];
// Export the public IP for Wordpress.
// Depending on the k8s cluster, this value may be an IP address or a hostname.
export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);
