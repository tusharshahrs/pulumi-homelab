import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("kafka", {cidrBlock: "192.168.0.0/22"});
const azs = aws.getAvailabilityZones({
    state: "available",
});
const subnetAz1 = new aws.ec2.Subnet("kafkasubnetAz1", {
    availabilityZone: azs.then(azs => azs.names[0]),
    cidrBlock: "192.168.0.0/24",
    vpcId: vpc.id,
});
const subnetAz2 = new aws.ec2.Subnet("kafkasubnetAz2", {
    availabilityZone: azs.then(azs => azs.names[1]),
    cidrBlock: "192.168.1.0/24",
    vpcId: vpc.id,
});
const subnetAz3 = new aws.ec2.Subnet("kafkasubnetAz3", {
    availabilityZone: azs.then(azs => azs.names[2]),
    cidrBlock: "192.168.2.0/24",
    vpcId: vpc.id,
});
const sg = new aws.ec2.SecurityGroup("kafkasg", {vpcId: vpc.id});
const kms = new aws.kms.Key("kafkakms", {description: "example"});
const test = new aws.cloudwatch.LogGroup("kafkatest", {});
const bucket = new aws.s3.Bucket("kafkabucket", {acl: "private"});
const firehoseRole = new aws.iam.Role("kafkafirehoseRole", {assumeRolePolicy: `{
"Version": "2012-10-17",
"Statement": [
  {
    "Action": "sts:AssumeRole",
    "Principal": {
      "Service": "firehose.amazonaws.com"
    },
    "Effect": "Allow",
    "Sid": ""
  }
  ]
}
`});
const testStream = new aws.kinesis.FirehoseDeliveryStream("kafkatestStream", {
    destination: "s3",
    s3Configuration: {
        roleArn: firehoseRole.arn,
        bucketArn: bucket.arn,
    },
    tags: {
        LogDeliveryEnabled: "placeholder",
    },
});
const example = new aws.msk.Cluster("kafkaexample", {
    clusterName: "kafkaexample",
    kafkaVersion: "2.4.1.1",
    numberOfBrokerNodes: 3,
    brokerNodeGroupInfo: {
        //instanceType: "kafka.m5.large",
        instanceType: "kafka.t3.small",
        ebsVolumeSize: 10,
        clientSubnets: [
            subnetAz1.id,
            subnetAz2.id,
            subnetAz3.id,
        ],
        securityGroups: [sg.id],
    },
    encryptionInfo: {
        encryptionAtRestKmsKeyArn: kms.arn,
    },
    openMonitoring: {
        prometheus: {
            jmxExporter: {
                enabledInBroker: true,
            },
            nodeExporter: {
                enabledInBroker: true,
            },
        },
    },
    loggingInfo: {
        brokerLogs: {
            cloudwatchLogs: {
                enabled: true,
                logGroup: test.name,
            },
            firehose: {
                enabled: true,
                deliveryStream: testStream.name,
            },
            s3: {
                enabled: true,
                bucket: bucket.id,
                prefix: "logs/msk-",
            },
        },
    },
    tags: {
        foo: "kafkabar",
    },
});
export const zookeeperConnectString = example.zookeeperConnectString;
export const bootstrapBrokersTls = example.bootstrapBrokersTls;
export const mks_kafka_version= example.kafkaVersion;
export const mks_kafka_clustername=example.clusterName;
export const mks_kafka_numberOfBrokerNodes=example.numberOfBrokerNodes;
