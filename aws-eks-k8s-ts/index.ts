import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const myprofile = config.get("aws_profile_name");

const awsProvider = new aws.Provider("aws-provider-stage", {
    region: "us-east-2",
    profile: myprofile,
    maxRetries: 1
});

export const awsprovider_id = awsProvider.id;
export const awsprovider_urn = awsProvider.urn;
const kafkaStageVPC = new awsx.ec2.Vpc("shaht-kafka-vpc", {

    subnets: [{ type: "public" }],
    cidrBlock: "10.1.0.0/24",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: { "Name": "shaht-kafka-vpc" },
},
    {
        provider: awsProvider,
    }
);

const myKafkaCluster = new eks.Cluster("shaht-kafka", {
    vpcId: kafkaStageVPC.id,
    subnetIds: kafkaStageVPC.publicSubnetIds,
    storageClasses: "gp2",
    version: "1.16",
    deployDashboard: false,
    tags: { "Name": "shaht-eks-cluster" },
    providerCredentialOpts: {
        profileName: myprofile,
    },
    nodeGroupOptions: {
        instanceType: "t2.small",
        spotPrice: "0.9",
        desiredCapacity: 3,
        minSize: 3,
        maxSize: 6
    }
},
    {
        provider: awsProvider,
        dependsOn: kafkaStageVPC
    }
);

export const kafka_StageVPC_id = kafkaStageVPC.id;
export const kafka_StageVPC_publicSubnetIds = kafkaStageVPC.publicSubnetIds;
export const kafka_StageVPC_enableDnsHostnames = kafkaStageVPC.vpc.enableDnsHostnames;
export const kafka_StageVPC_enableDnsSupport = kafkaStageVPC.vpc.enableDnsSupport;
export const kafka_StageVPC_cidrBlock = kafkaStageVPC.vpc.cidrBlock;
export const Kafka_Cluster_name = myKafkaCluster.core.cluster.name;
export const Kafka_Cluster_id = myKafkaCluster.core.cluster.id;
export const Kafka_Cluster_version = myKafkaCluster.core.cluster.version;
export const Kafka_Cluster_status = myKafkaCluster.core.cluster.status;

const monitorNamespace = new k8s.core.v1.Namespace("monitor", {
    metadata:
    {
        name: `monitor-ns`
    },
}, { provider: myKafkaCluster.provider });

export const my_kubernetes_ns = monitorNamespace.metadata.name;
export const kubeconfig = pulumi.secret(myKafkaCluster.kubeconfig);

const prometheusStack = new k8s.helm.v3.Chart("kube-prometheus-stack", {
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts"
    },
    chart: "kube-prometheus-stack",
    version: "11.1.1",
    namespace: monitorNamespace.metadata.name,
}, {
    provider: myKafkaCluster.provider,
    dependsOn: monitorNamespace,
    customTimeouts: {
        create: "4m"
    }
});

export const helm_chart_prometheus_urn = prometheusStack.urn;
//export const helm_chart_prometheus_urn2 = prometheusStack.getResource.name;

//const frontend = prometheusStack.getResourceProperty("v1/Service", "kube-prometheus-stack", "status");
//const ingress = frontend.loadBalancer.ingress[0];

//export const frontendIp = ingress.apply(x => x.ip ?? x.hostname);
