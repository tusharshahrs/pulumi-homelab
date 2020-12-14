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
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { config } from "./config";

const mydbpassword = new random.RandomPassword("wordpresspwd", {
    length: 10,
    special: false,
    upper: true,
    number: true,
});

// Create a k8s provider.
const provider = new k8s.Provider("provider", {
    kubeconfig: config.kubeconfig,
    //namespace: config.appsNamespaceName
});

// Deploy the latest version of the stable/wordpress chart.
const chartId = "wpdev";
const chartName = "wordpress" ;
const wordpress = new k8s.helm.v3.Chart(chartId, {
    namespace: config.appSvcsNamespaceName,
    chart: chartName,
    version: "10.0.3",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami/",
    },
    values: {persistence: {enabled:true},
             autoscaling: {enabled:true, minReplicas: 2},
            metrics: {enabled: true},
            wordpressScheme: "https",
            wordpresspwd: `${mydbpassword}`,
            mariadb: {architecture: "replication"},
            //mariadb: {auth: {password: `${mydbpassword}`},}, 
                      //primary: {persistence: {enabled: true}}
        } 
            //mariadb: {primary: {persistence: {enabled: true}}},},
            //mariadb: {primary: {persistence: {enabled: true}}},}
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
//const frontend = wordpress.getResourceProperty("v1/Service", "app-svcs-chxunxlp/wpdev-wordpress","status");
//export const frontend = config.appSvcsNamespaceName.apply(v => wordpress.getResourceProperty("v1/Service", `${v}/wpdev-wordpress`,"status"))
export const frontend = config.appSvcsNamespaceName.apply(v => wordpress.getResourceProperty("v1/Service", `${v}/${chartId}-${chartName}`,"status"))
const ingress = frontend.loadBalancer.ingress[0];
// Export the public IP for Wordpress.
// Depending on the k8s cluster, this value may be an IP address or a hostname.
export const frontendIp =  pulumi.interpolate`https://${ingress.hostname}`;
//export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);
