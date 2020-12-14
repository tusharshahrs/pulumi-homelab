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
import { config } from "./config";

// Create a k8s provider.
const provider = new k8s.Provider("provider", {
    kubeconfig: config.kubeconfig,
    //namespace: config.appsNamespaceName
});

// Deploy the latest version of the stable/wordpress chart.
const wordpress = new k8s.helm.v3.Chart("wpdev", {
    namespace: config.appSvcsNamespaceName,
    chart: "wordpress",
    version: "10.0.3",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami/",
    },
    values: {persistence: {enabled:true},
             autoscaling: {enabled:true, minReplicas: 2},}
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
//export const mywordpress_getResourceProperty_middlevalue = pulumi.output(config.appSvcsNamespaceName);
//export const mywordpress_getResourceProperty_middlevalue2 = `${mywordpress_getResourceProperty_middlevalue}/wpdev-wordpress`;

// Get the status field from the wordpress service, and then grab a reference to the ingress field.
// Below works but is hard coded
const frontend = wordpress.getResourceProperty("v1/Service", "app-svcs-chxunxlp/wpdev-wordpress","status");
//const frontend = wordpress.getResourceProperty("v1/Service", `${config.appSvcsNamespaceName}/wpdev-wordpress`,"status");

const ingress = frontend.loadBalancer.ingress[0];
// Export the public IP for Wordpress.
// Depending on the k8s cluster, this value may be an IP address or a hostname.
export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);
