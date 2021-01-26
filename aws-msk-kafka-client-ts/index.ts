import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Config, getStack, getProject, StackReference } from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";
import { ec2 } from "@pulumi/aws/types/enums";
// Based on this: https://docs.aws.amazon.com/msk/latest/developerguide/create-client-machine.html
const config = new pulumi.Config();
const networkingStack = new StackReference(config.require("networkingStack"));
const vpc_id = networkingStack.getOutput("pulumi_vpc_id");
const vpc_privatesubnetids = networkingStack.getOutput("pulumi_vpc_private_subnet_ids");
const vpc_publicsubnetids = networkingStack.getOutput("pulumi_vpc_public_subnet_ids");
const subnetaz1 = vpc_publicsubnetids.apply(vpc_publicsubnetids => vpc_publicsubnetids[0]);
const projectName = getProject();
const stackName = getStack();

const myname = "shaht-mskclient";

const kafkastack = new StackReference(config.require("mskStack"))
const security_group_kafka = kafkastack.getOutput("security_group_id");
const kafka_msk_cluster_arn = kafkastack.getOutput("msk_cluster_arn");

const msk_cluster_arn = kafka_msk_cluster_arn.apply(kafka_msk_cluster_arn => kafka_msk_cluster_arn);
//let msk_kafka_securitygroup: string[];
//security_group_kafka.apply(security_group_kafka=>msk_kafka_securitygroup.push(security_group_kafka));
let mysecurity_group =  security_group_kafka.apply(security_group_kafka => security_group_kafka);

export const sshPrivateKey = new tls.PrivateKey(`${myname}-privatekey`, {
    algorithm: "RSA",
    rsaBits: 4096,
});

const mykeypair = new aws.ec2.KeyPair(`${myname}-keypair`, {
    publicKey: sshPrivateKey.publicKeyOpenssh,
    keyName: `${myname}`,
});

// Get the AMI
const amiId = aws.getAmi({
    owners: ["amazon"],
    mostRecent: true,
    filters: [{
        name: "name",
        values: ["amzn2-ami-hvm-2.0.????????-x86_64-gp2"],
    }],
}, { async: true }).then(ami => ami.id);

const name = "shaht"
const size = "t3a.micro";
export const keypair_name = mykeypair.keyName; // same as export const keypair_id = mykeypair.id;
export const keypair_arn = mykeypair.arn;
export const keypair_finger = mykeypair.fingerprint;
export const keypair_publicKey = mykeypair.publicKey;

const userData =
    `#!/bin/bash
    sudo yum update -y
    sudo yum -y install java-1.8.0
    wget https://archive.apache.org/dist/kafka/2.2.1/kafka_2.12-2.2.1.tgz
    tar -xzf kafka_2.12-2.2.1.tgz
    cd kafka_2.12-2.2.1
    `;

const msk_client_server = new aws.ec2.SpotInstanceRequest(`${name}-msk-client`, {
    ami: amiId,
    instanceType: size,
    keyName: mykeypair.keyName,
    spotPrice: "0.05",
    ebsOptimized: true,
    instanceInitiatedShutdownBehavior: "terminate",
    userData: userData,
    subnetId: subnetaz1,
    vpcSecurityGroupIds: [mysecurity_group],

}, {dependsOn: mykeypair});


export const sshkey_urn = sshPrivateKey.urn;
export const sshkey_privateKeyPem = sshPrivateKey.privateKeyPem;
export const amiId_id = amiId;

// MSK storage autoscaling: https://github.com/hashicorp/terraform-provider-aws/issues/15796
//https://docs.aws.amazon.com/autoscaling/application/APIReference/API_RegisterScalableTarget.html
const mskcluster_appautoscaling_target = new aws.appautoscaling.Target(`${name}-msk-autoscaling-target`, {
    maxCapacity: 200,
    minCapacity: 1,
    resourceId: msk_cluster_arn,
    scalableDimension: "kafka:broker-storage:VolumeSize",
    serviceNamespace: "kafka",
});

// MSK storage autoscaling: https://github.com/hashicorp/terraform-provider-aws/issues/15796
const mskcluster_appautoscaling_policy = new aws.appautoscaling.Policy(`${name}-msk-autoscaling-target`, {
    policyType: "TargetTrackingScaling",
    resourceId: mskcluster_appautoscaling_target.id,
    scalableDimension: mskcluster_appautoscaling_target.scalableDimension,
    serviceNamespace: mskcluster_appautoscaling_target.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
            predefinedMetricType: "KafkaBrokerStorageUtilization",
        },
        targetValue: 10,
    }
});
//msk_cluster_arn