// Copyright 2016-2019, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as awsx from "@pulumi/awsx";
import * as k8s from "@pulumi/kubernetes";
import { Secret } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { config } from "./config";

// Create a k8s provider.
const provider = new k8s.Provider("provider", {
    kubeconfig: config.kubeconfig,
    //namespace: config.appsNamespaceName
});

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

// Deploy the latest version of the stable/wordpress chart.
// The Values are from here:  https://artifacthub.io/packages/helm/bitnami/wordpress
const chartId = "wpdev";
const chartName = "wordpress";
const wordpress = new k8s.helm.v3.Chart(chartId, {
    namespace: config.appSvcsNamespaceName,
    chart: chartName,
    version: "10.1.1",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami/",
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
            ingress: { enabled: true},
            readinessProbe: {enabled: false},
            wordpressScheme: "https",
            wordpresspwd:mydbpassword.result,
            mariadb: {architecture: "replication", 
                      auth: {rootPassword: mariadbRootPassword.result, password: mariadbpassword.result}, 
                      primary: {persistence: {enabled: true}}}, 
        } 
/*         transformations: [
        (obj: any) => {
            // Do transformations on the YAML to set the namespace
            if (obj.metadata) {
                obj.metadata.namespace = config.appsNamespaceName;
            }
        },
    ], */
  
},{ provider: provider,});

// Export the public IP for WordPress.
// Get the status field from the wordpress service, and then grab a reference to the ingress field.
export const frontend = config.appSvcsNamespaceName.apply(v => wordpress.getResourceProperty("v1/Service", `${v}/${chartId}-${chartName}`,"status"))
const ingress = frontend.loadBalancer.ingress[0];
// Export the public IP for Wordpress.
// Depending on the k8s cluster, this value may be an IP address or a hostname.
export const frontendIp =  pulumi.interpolate`https://${ingress.hostname}`;
//export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);