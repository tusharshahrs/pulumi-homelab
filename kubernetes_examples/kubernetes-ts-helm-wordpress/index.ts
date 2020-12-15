// Copyright 2016-2020, Pulumi Corporation.  All rights reserved.

import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import * as random from "@pulumi/random";
import * as pulumi from "@pulumi/pulumi";


// Create an EKS cluster with the default configuration.
const cluster = new eks.Cluster("shaht-my-cluster");

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;

function toBase64(s: string): string {
    return Buffer.from(s).toString("base64");
}

// Creates a random password for wordpressPassword
const mydbpassword = new random.RandomPassword("wordpresspassword", {
    length: 10,
    special: false,
    upper: true,
    lower: true,
    number: false,
},);

// wordpressPassword
export const mywordpressPassword_value = pulumi.secret(mydbpassword.result);

// Creates a random password for mariadb.auth.rootPassword
const mariadbRootPassword = new random.RandomPassword("mariadbrootpwd", {
    length: 10,
    special: false,
    lower: true,
    upper: true,
    number: false,
},);

// mariadbauthrootPassword
export const mariadbauthRootPassword_value = pulumi.secret(mariadbRootPassword.result);

// Creates a random password for mariadb.auth.password
const mariadbpassword = new random.RandomPassword("mariadbpassword", {
    length: 10,
    special: false,
    upper: true,
    lower: true,
    number: false,
},);

// mariadb.auth.password.  This is NOT root
export const mariadbauthPassword_value= pulumi.secret(mariadbpassword.result);


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
    version: "9.6.0",
    chart: "wordpress",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    values: {
        persistence: {enabled:true},
        replicaCount: 2,
        allowOverrideNone: true,
        autoscaling: {enabled:true, minReplicas: 2},
        allowEmptyPassword: true,
        htaccessPersistenceEnabled: true,
        wordpressFirstName: "John",
        wordpressLastName: "Smith",
        wordpressScheme: "https",
        //livenessProbeHeaders:  { "X-Forwarded-Proto": "https" },
        //readinessProbeHeaders: { "X-Forwarded-Proto": "https" },
        //customLivenessProbe: { httpGet: { path: "/wp-login.php", port: 8080, scheme: "HTTPS"}, initialDelaySeconds: 5, timeoutSeconds: 3},
        //customReadinessProbe: { httpGet: { path: "/wp-login.php", port: 8080, scheme: "HTTPS"}, initialDelaySeconds: 15, timeoutSeconds: 10},
        //customLivenessProbe: { httpGet: { path: "/", port: 8080, scheme: "HTTPS"}, initialDelaySeconds: 5, timeoutSeconds: 3},
        //customReadinessProbe: { httpGet: { path: "/wp-login.php",port: 8080, scheme: "HTTPS"}, initialDelaySeconds: 15, timeoutSeconds: 15},
        //livenessProbeHeaders: { httpGet: { path: "/healthz",port: "http", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},
        //readinessProbeHeaders: { httpGet: { path: "/healthz",port: "http", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},
        //customLivenessProbe: { httpGet: { path: "/healthz",port: "http", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},
        //customReadinessProbe: { httpGet: { path: "/healthz",port: "http", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},
        //customLivenessProbe: { httpGet: { path: "/healthz",port: "https", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},
        customReadinessProbe: { httpGet: { path: "/healthz",port: "https", scheme: "HTTPS", periodSeconds: 10, initialDelaySeconds: 5, timeoutSeconds: 1,failureThreshold: 3}},

        wordpresspwd:mydbpassword.result,
        mariadb: {architecture: "replication", 
                  auth: {rootPassword: mariadbRootPassword.result, password: mariadbpassword.result}, 
                  primary: {persistence: {enabled: true}}},         
    } 
}, { provider: cluster.provider });

// Get the status field from the wordpress service, and then grab a reference to the ingress field.
//const frontend = wordpress.getResourceProperty("v1/Service", "wpdev-wordpress","status");
const frontend = wordpress.getResourceProperty("v1/Service", "wordpress-ns/wpdev-wordpress","status");
const ingress = frontend.loadBalancer.ingress[0];
// Export the public IP for Wordpress.
// Depending on the k8s cluster, this value may be an IP address or a hostname.
export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);
