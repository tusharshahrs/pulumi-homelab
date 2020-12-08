import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("kafka", {cidrBlock: "192.168.0.0/22"});
const azs = aws.getAvailabilityZones({
    state: "available",
});
const subnetAz1 = new aws.ec2.Subnet("kafka-subnetAz1", {
    availabilityZone: azs.then(azs => azs.names[0]),
    cidrBlock: "192.168.0.0/24",
    vpcId: vpc.id,
});
const subnetAz2 = new aws.ec2.Subnet("kafka-subnetAz2", {
    availabilityZone: azs.then(azs => azs.names[1]),
    cidrBlock: "192.168.1.0/24",
    vpcId: vpc.id,
});
const subnetAz3 = new aws.ec2.Subnet("kafka-subnetAz3", {
    availabilityZone: azs.then(azs => azs.names[2]),
    cidrBlock: "192.168.2.0/24",
    vpcId: vpc.id,
});
const sg = new aws.ec2.SecurityGroup("kafka-sg", {vpcId: vpc.id});
const kms = new aws.kms.Key("kafka-kms", {description: "msk"});
const test = new aws.cloudwatch.LogGroup("kafka-test", {});
const bucket = new aws.s3.Bucket("kafka-bucket", {acl: "private"});
const firehoseRole = new aws.iam.Role("kafka-firehoseRole", {assumeRolePolicy: `{
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
const testStream = new aws.kinesis.FirehoseDeliveryStream("kafka-testStream", {
    destination: "s3",
    s3Configuration: {
        roleArn: firehoseRole.arn,
        bucketArn: bucket.arn,
    },
    tags: {
        LogDeliveryEnabled: "placeholder",
    },
});
const msk = new aws.msk.Cluster("kafka-msk", {
    clusterName: "kafka-msk",
    kafkaVersion: "2.6.0",
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
        encryptionInTransit: {clientBroker:"TLS", inCluster: true }
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
        foo: "kafka-foobar",
    },
});
export const zookeeperConnectString = msk.zookeeperConnectString;
export const bootstrapBrokersTls = msk.bootstrapBrokersTls;
export const mks_kafka_version= msk.kafkaVersion;
export const mks_kafka_clustername=msk.clusterName;
export const mks_kafka_numberOfBrokerNodes=msk.numberOfBrokerNodes;
export const mks_kafka_id=msk.id;
export const mks_kafka_encryptioninfo=msk.encryptionInfo;
export const mks_kafka_enhancedMonitoring=msk.enhancedMonitoring;
export const mks_kafka_arn=msk.arn;