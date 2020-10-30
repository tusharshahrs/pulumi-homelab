import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { ec2 } from "@pulumi/aws/types/enums";

// Allocate a new VPC that uses 3 availability zones, instead of 2:
const vpc = new awsx.ec2.Vpc("tusharcustom-ro", {
    cidrBlock: "10.0.0.0/24",
    numberOfAvailabilityZones: 3,
    tags: {"Name":"pulumi-vpc-shaht-ro"},
    numberOfNatGateways: 1,
});


const securitygroup2 = new aws.ec2.SecurityGroup("shaht-standalone-sg", {
    name: "shaht-standalone-sg",
    vpcId: vpc.id,
    egress: [{
        description: "Egress shaht securitygroup",
        protocol: "tcp",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: { "Name": "shaht-standalone-sg", "awsx": "yes", "customer-demo": "yes", "testing": "no" },

});

 const securitygroup = new aws.ec2.SecurityGroup("shaht-datastore-sg", {
    name: "shaht-datastore-sg",
    description: "Security group rule overall",
    vpcId: vpc.id,
    egress: [{
        description: "Egress shaht securitygroup",
        protocol: "tcp",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
     ingress: [{ 
        description: "Ingress shaht securitygroup",
        fromPort: 0,
        toPort: 0,
        protocol: "tcp",
        self: true,
        },
        {
        description: "ingress shaht securitygroup PostgreSQL port 5432",
        fromPort: 5432,
        toPort: 5432,
        protocol: "tcp",
        //securityGroups: [securitygroup2.id],
        self: true,
        },
        {
        description: "ingress shaht securitygroup RDS port 3306",
        fromPort: 3306,
        toPort: 3306,
        protocol: "tcp",
        securityGroups: [securitygroup2.id],
        self: true,
        }],
    tags: { "Name": "shaht-datastore-sg", "awsx": "yes", "customer-demo": "yes", "testing": "no" },
});

/* const securitygrouprule = new aws.ec2.SecurityGroupRule("datastore-sg-shared-eks-nodes-sgr", {
    type: "ingress",
    fromPort: 5432,
    toPort: 5432,
    protocol: "tcp",
    description: "ingress shaht securitygrouprule port 5432",
    securityGroupId: securitygroup.id,
    sourceSecurityGroupId: securitygroup.id,
}); */
    
// Export a few resulting fields to make them easy to use:
export const vpcId = vpc.id;
export const vpcPrivateSubnetIds = vpc.privateSubnetIds;
export const vpcPublicSubnetIds = vpc.publicSubnetIds;
export const my_securitygroup = securitygroup.id;
export const my_securitygroupname = securitygroup.name;
export const my_securitygroupname2 = securitygroup2.name;