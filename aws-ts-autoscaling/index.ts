import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// importing local configs
const config = new pulumi.Config();
const env = pulumi.getStack()
const name_prefix = config.require("name_prefix");
const zone_number = config.requireNumber("zone_number");
const vpc_cidr = config.require("vpc_cidr");
const number_of_nat_gateways = config.requireNumber("number_of_nat_gateways");

const baseTags = {
    "Name": `${name_prefix}`,
    "availability_zones_used": `${zone_number}`,
    "cidr_block": `${vpc_cidr}`,
    "crosswalk": "yes",
    "number_of_nat_gateways": `${number_of_nat_gateways}`,
    "demo": "true",
    "pulumi:Project": pulumi.getProject(),
    "pulumi:Stack": pulumi.getStack(),
    "cost_center": "1234",
  }

const myvpc = new awsx.ec2.Vpc(`${name_prefix}-vpc`, {
    cidrBlock: vpc_cidr,
    numberOfAvailabilityZones: zone_number,
    numberOfNatGateways: number_of_nat_gateways,
    tags: baseTags,
  });

const cluster = new awsx.ecs.Cluster(`${name_prefix}-ecs`, 
    { vpc: myvpc,
    
    });


const minsize = 5;
const maxsize = 10;

const autoScalingGroup =cluster.createAutoScalingGroup(`${name_prefix}-autoScalingGroup`,
            {
                vpc: myvpc,
                launchConfigurationArgs: { instanceType: "t3a.medium"},
                templateParameters: {
                    minSize: minsize,
                    maxSize: maxsize,
                    healthCheckGracePeriod: 300,
                    healthCheckType: 'ELB',
                },
            }
        );