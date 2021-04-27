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
let mysecurity_group =  security_group_kafka.apply(security_group_kafka => security_group_kafka);

const sshPrivateKey = new tls.PrivateKey(`${myname}-privatekey`, {
    algorithm: "RSA",
    rsaBits: 4096,
});

const mykeypair = new aws.ec2.KeyPair(`${myname}-keypair`, {
    publicKey: sshPrivateKey.publicKeyOpenssh,
    keyName: `${myname}`,
});

// Get the AMI
const amiId = aws.ec2.getAmi({
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
    sudo yum -y install curl
    sudo yum -y install java-1.8.0
    cd /home/ec2-user
    wget https://archive.apache.org/dist/kafka/2.2.1/kafka_2.12-2.2.1.tgz
    tar -xzf kafka_2.12-2.2.1.tgz
    curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
    sudo yum install -y nodejs
    curl -fsSL https://get.pulumi.com | sh -s -- --version 2.24.1
    `;

const msk_client_instance = new aws.ec2.Instance(`${name}-msk-instance`, {
    ami: amiId,
    instanceType: size,
    keyName: mykeypair.keyName,
    ebsOptimized: true,
    userData: userData,
    subnetId: subnetaz1,
    vpcSecurityGroupIds: [mysecurity_group],
    instanceInitiatedShutdownBehavior: "terminate",
    tags: {"Name":`${name}-msk-instance`,"env":"dev", "team": "pulumi-ce-team","user":"shaht"}
}, { dependsOn: mykeypair})

/*const msk_client_server = new aws.ec2.SpotInstanceRequest(`${name}-msk-client`, {
    ami: amiId,
    instanceType: size,
    keyName: mykeypair.keyName,
    spotPrice: "0.05",
    ebsOptimized: true,
    //instanceInitiatedShutdownBehavior: "terminate",
    userData: userData,
    subnetId: subnetaz1,
    vpcSecurityGroupIds: [mysecurity_group],
    tags: {"Name":`${name}-msk-client`},

}, {dependsOn: mykeypair});
*/

export const sshkey_urn = sshPrivateKey.urn;
export const sshkey_privateKeyPem = sshPrivateKey.privateKeyPem;
export const amiId_id = amiId;

// MSK storage autoscaling: https://github.com/hashicorp/terraform-provider-aws/issues/15796
//https://docs.aws.amazon.com/autoscaling/application/APIReference/API_RegisterScalableTarget.html
const mskcluster_appautoscaling_target = new aws.appautoscaling.Target(`${name}-msk-autoscaling-target`, {
    maxCapacity: 1000,
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

export const mskcluster_appautoscaling_target_id = mskcluster_appautoscaling_target.id;
export const mskcluster_appautoscaling_target_maxCapacity = mskcluster_appautoscaling_target.maxCapacity;
export const mskcluster_appautoscaling_target_minCapacity = mskcluster_appautoscaling_target.minCapacity;
export const mskcluster_appautoscaling_target_resourceId = mskcluster_appautoscaling_target.resourceId;
export const mskcluster_appautoscaling_target_rolearn = mskcluster_appautoscaling_target.roleArn;
export const mskcluster_appautoscaling_target_scalableDimension = mskcluster_appautoscaling_target.scalableDimension;
export const mskcluster_appautoscaling_target_serviceNamespace = mskcluster_appautoscaling_target.serviceNamespace;
export const mskcluster_appautoscaling_target_urn = mskcluster_appautoscaling_target.urn;
export const mskcluster_appautoscaling_policy_name = mskcluster_appautoscaling_policy.name;
export const mskcluster_appautoscaling_policy_id = mskcluster_appautoscaling_policy.id;
export const mskcluster_appautoscaling_policy_arn = mskcluster_appautoscaling_policy.arn;
export const mskcluster_appautoscaling_policy_policytype = mskcluster_appautoscaling_policy.policyType;
export const mskcluster_appautoscaling_scalableDimension = mskcluster_appautoscaling_policy.scalableDimension;
export const mskcluster_appautoscaling_policy_serviceNamespace = mskcluster_appautoscaling_policy.serviceNamespace;
export const mskcluster_appautoscaling_policy_stepScalingPolicyConfiguration = mskcluster_appautoscaling_policy.stepScalingPolicyConfiguration;
export const mskcluster_appautoscaling_policy_targetTrackingScalingPolicyConfiguration = mskcluster_appautoscaling_policy.targetTrackingScalingPolicyConfiguration;
export const mskcluster_appautoscaling_policy_urn = mskcluster_appautoscaling_policy.urn;
export const msk_client_instance_name = msk_client_instance.id;