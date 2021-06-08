import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksStack, cluster,kubeconfig,k8sProvider,projectName,stackName, } from "./common";

// Create a Kubernetes Namespace
const nginxnamespace = new k8s.core.v1.Namespace(projectName, {
    metadata: {
        name: "nginx",
    }
}, { provider: k8sProvider });

export const nginx_namespace = nginxnamespace.metadata.name;

/**
 * Create a NGINX Deployment using Helm
 */
 /*const nginxHelm = new k8s.helm.v3.Chart(`${projectName}-helm`, {
    namespace: nginxnamespace.metadata.name,
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    chart: "nginx",
    version: "8.9.0", // 5.6.0 -> 5.7.0
    transformations: [ // Helm Chart: https://github.com/bitnami/charts/blob/master/bitnami/nginx/templates/deployment.yaml
        // (obj: any) => {
        //     if (obj.kind == "Deployment") {
        //         obj.spec.replicas = 2
        //     }
        // }
    ],
}, { parent: nginxnamespace });
*/
//export const nginx_helmchart = nginxHelm.parseChart.name;
