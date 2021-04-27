import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Config, getStack, getProject, StackReference } from "@pulumi/pulumi";

// msk kafka cluster first part of name
const my_name = `shaht-kafka`;

const config = new pulumi.Config();
const networkingStack = new StackReference(config.require("networkingStack"));
const vpc_id = networkingStack.getOutput("pulumi_vpc_id");
const vpc_privatesubnetids = networkingStack.getOutput("pulumi_vpc_private_subnet_ids");
const vpc_publicsubnetids = networkingStack.getOutput("pulumi_vpc_public_subnet_ids");
const projectName = getProject();
const stackName = getStack();

const myip = config.get("myipaddress");
//const myip = myipsecret.apply(myipsecret => myipsecret);

// Basic Tags
const mytags = {"eks":"yes","clustertags":"yes" ,"launched_by":"shaht","demo":"yes", "env":"dev", "projectName": projectName, "stackName": stackName,};


export const sg = new aws.ec2.SecurityGroup(`${my_name}-sg`, 
    {
        vpcId: vpc_id,
        egress: [{
            description: "egress outbound rule for msk cluster",
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        }],
        ingress: [
            {
            description: "ingress rule for msk cluster for clients",
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            self: true,
            cidrBlocks: [`${myip}`],
            },
            {
            description: "my ssh rule for client server",
            protocol: "tcp",
            fromPort: 22,
            toPort: 22,
            self: false,
            cidrBlocks: [`${myip}`]
            },
            /*{
            description: "all ports for tushar shah",
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            self: false,
            cidrBlocks: [`${myip}`]
            },*/  
    ],
    tags: {"Name": `${my_name}-sg`}

    });
export const kms = new aws.kms.Key(`${my_name}-kms`, {description: "msk kafka kms key"});
const test = new aws.cloudwatch.LogGroup(`${my_name}-kms-cloudwatch-loggroup`, {});
const bucket = new aws.s3.Bucket(`${my_name}-bucket`, {acl: "private", forceDestroy: true});

const subnetAz1 = vpc_publicsubnetids.apply(vpc_publicsubnetids => vpc_publicsubnetids[0]);
const subnetAz2 = vpc_publicsubnetids.apply(vpc_publicsubnetids => vpc_publicsubnetids[1]);
const subnetAz3 = vpc_publicsubnetids.apply(vpc_publicsubnetids => vpc_publicsubnetids[2]);

const firehoseRole = new aws.iam.Role(`${my_name}-firehoseRole`, {
  assumeRolePolicy: `{
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
    `,
});

const testStream = new aws.kinesis.FirehoseDeliveryStream(`${my_name}-kinesisFireHoseDeliverySteream`, {
  destination:"s3",
  s3Configuration: {
    roleArn: firehoseRole.arn,
    bucketArn: bucket.arn,
  },
  tags: {
    LogDeliveryEnabled: "placeholder",
  },
});

const msk = new aws.msk.Cluster(`${my_name}-msk`, {
    kafkaVersion: "2.3.1",
    numberOfBrokerNodes: 3,
    brokerNodeGroupInfo: {
        instanceType: "kafka.t3.small",
        ebsVolumeSize: 10,
        clientSubnets: [
            subnetAz1,
            subnetAz2,
            subnetAz3
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
        Name: "shaht-kafka-cluster",
        team: "pulumi-ce-team",
        env: "dev"
    },
});

export const msk_cluster_arn = msk.arn;
export const msk_cluster_name = msk.clusterName;
export const security_group_name = sg.name;
export const security_group_arn = sg.arn;
export const security_group_id = sg.id;