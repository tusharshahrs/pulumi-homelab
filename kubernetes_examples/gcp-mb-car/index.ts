import * as k8s from "@pulumi/kubernetes";
//import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
//import * as gcp from "@pulumi/gcp";
//import { NetworkEndpointGroup } from "@pulumi/gcp/compute";

const config = new pulumi.Config();
const clusterstackreference = new pulumi.StackReference(config.require("clusterStackRef"));
const mykubeconfig = clusterstackreference.getOutput("kubeconfig");

// Create a k8s provider.
const gcpprovider = new k8s.Provider("provider", {
    kubeconfig: mykubeconfig,
});

// creating a namespace for the services
const shahtns = new k8s.core.v1.Namespace("shaht-Namespace", {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
        name: "shaht-ns",
    },
}, { provider: gcpprovider });

const app_push_apiDeployment = new k8s.apps.v1.Deployment("app_push_apiDeployment", {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: "app-push-api-test",
        namespace: shahtns.metadata.name,
        labels: {app: "app-push-api-test"}, 
        
    },
    spec: {
        selector: {
            matchLabels: {
                app: "app-push-api-test",
            },
        },
        replicas: 2,
        template: {
            metadata: {
                labels: {
                    app: "app-push-api-test",
                },
            },
            spec: {
                containers: [{
                    name: "app-push-api-test",
                    //image: "gcr.io/cariq-payments-test/i2c-push-api:latest",
                    image: "nginx",
                    imagePullPolicy: "Always",
                    ports: [{
                        containerPort: 9443,
                    }],
                }],
            },
        },
    },
}, {provider: gcpprovider});

 const app_push_api_srvService = new k8s.core.v1.Service("app_push_api_srvService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "app-push-api-srv",
        annotations: {
            //"cloud.google.com/neg": '{"ingress": true, "exposed_ports": {"9443": {"name": "app-push-api-test"}}}"',
            //"cloud.google.com/neg": '{"ingress": true, "exposed_ports": "9443"}}"',
            //"cloud.google.com/backend-config": '{"default": "app-push-api-srv"}',
            //"cloud.google.com/neg": '{"ingress": true}"',
            "cloud.google.com/neg": "{\"ingress\": true}",
          },
        namespace: shahtns.metadata.name,
        //labels: { app: "app-push-api-test" },
        labels: { app: "app-push-api-srv" },
    },
    spec: {
        //type: "ClusterIP",
        type: "NodePort",
        selector: { app: "app-push-api-test" },
        ports: [
          {
            port: 9443,
            targetPort: 9443,
            //nodePort: 32640,
          },
        ],
        //selector: { app: "app-push-api-test" },
        //type: "NodePort",
      },
}, {provider: gcpprovider});

 const app_push_api_ext_lbIngress = new k8s.networking.v1beta1.Ingress("app_push_api_ext_lbIngress", {
    apiVersion: "networking.k8s.io/v1beta1",
    kind: "Ingress",
    metadata: {
        name: "app-push-api-ext-lb",
        namespace: shahtns.metadata.name,
        labels: {
            app: "app-push-api-ingress",
        },
        annotations: {
            //"kubernetes.io/ingress.global-static-ip-name": "pushapi-ingress-ip-address",
            //"networking.gke.io/managed-certificates": "certificate-pushapi-ingress",
            //"kubernetes.io/ingress.allow-http": "false",
            //"ingress.kubernetes.io/backends": "app-push-api-srv",
            //"cloud.google.com/neg": '{"exposed_ports": {"9443":{}}}',
            //"anthos.cft.dev/autoneg": '{"name":"shahtcar-neg", "max_rate_per_endpoint":1000}',
            "cloud.google.com/neg-status": '{"zones":["us-central1-a", "us-central1-b"]}',
            "kubernetes.io/ingress.allow-http": "true",
            //"cloud.google.com/backend-config": '{"default": "app-push-api-srv"}',
            //"cloud.google.com/neg": '{"ingress": true, "exposed_ports": {"9443": {"name": "app-push-api-srv"}}}"',
            //"cloud.google.com/neg": '{"ingress": true, "exposed_ports": "9443"}"',
            "cloud.google.com/neg": '{"ingress": true}"',
            //"cloud.google.com/neg": '{"ingress": true, "zones":["us-central1-a", "us-central1-b"], "exposed_ports": {"9443"}}"',
        },
    },
    spec: {
        backend: {
            serviceName: "app-push-api-srv",
            servicePort: 9443,
           
        },
        
        //selector: { app: "app-push-api-srv", }, 
        rules: [{
            host: "test-pushapi.gocariq.com",
            http: {
                paths: [{
                    backend: {
                        serviceName: "app-push-api-srv",
                        servicePort: 9443,
                    },
                    path: "/*",
                }],
            },
        }],
    },
}, {provider: gcpprovider});

export const app_push_api_deployment_id = app_push_apiDeployment.id;
export const app_push_api_srvService_id = app_push_api_srvService.id;
export const app_push_api_srvService_status = app_push_api_srvService.status
export const app_push_api_ext_lbIngress_name = app_push_api_ext_lbIngress.metadata.name;