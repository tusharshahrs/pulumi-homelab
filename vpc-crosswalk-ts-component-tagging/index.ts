import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { registerAutoTags } from "./autotag"

// importing local configs
const config = new pulumi.Config();
registerAutoTags({
    "user:Project": pulumi.getProject(),
    "user:Stack": pulumi.getStack(),
    "user:Cost Center": config.require("costCenter"),
});

//const env = pulumi.getStack()
const vpc_name = config.get("vpc_name");
const zone_number = config.getNumber("zone_number");
const vpc_cidr = config.get("vpc_cidr");
const number_of_nat_gateways = config.getNumber("number_of_nat_gateways");
//const config_name = "Pulumi." + `${env}` + ".yaml";

//const baseTags = {
//    Name: `${vpc_name}`,
//    "availability_zones_used": `${zone_number}`,
//    "cidr_block": `${vpc_cidr}`,
//    "crosswalk":"yes",
//    "number_of_nat_gateways": `${number_of_nat_gateways}`,
//    "demo": "true",
//    "pulumi:Project": pulumi.getProject(),
//    "pulumi:Stack": pulumi.getStack(),
//    "cost_center": "1234",
//    "pulumi:Configs": config_name,
//}

// Allocate a new VPC with the CIDR range from config file:
const vpc = new awsx.ec2.Vpc(`${vpc_name}`, {
    cidrBlock: vpc_cidr,
    numberOfAvailabilityZones: zone_number,
    numberOfNatGateways: number_of_nat_gateways,
    //tags: baseTags,

});

// Export a few resulting fields to make them easy to use:
export const pulumi_vpc_name = vpc_name;
export const pulumi_vpc_id = vpc.id;
export const pulumi_vpc_az_zones = zone_number;
export const pulumi_vpc_cidr = vpc_cidr;
export const pulumic_vpc_number_of_nat_gateways = number_of_nat_gateways;
export const pulumi_vpc_private_subnet_ids = vpc.privateSubnetIds;
export const pulumi_vpc_public_subnet_ids = vpc.publicSubnetIds;
//export const pulumi_vpc_aws_tags = baseTags;