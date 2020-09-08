import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { registerAutoTags } from "./autotag"

// importing local configs
const config = new pulumi.Config();

const vpc_name = config.require("vpc_name");
const vpc_cidr = config.require("vpc_cidr");
//const zone_number = config.requireNumber("zone_number");
const number_of_nat_gateways = config.requireNumber("number_of_nat_gateways");

//
registerAutoTags({
    "user:Project": pulumi.getProject(),
    "user:Stack": pulumi.getStack(),
    "user:Cost Center": config.require("costCenter"),
    "VPC_name": `${vpc_name}`,
    "cidr_block": `${vpc_cidr}`,
//    "availability_zones_used": `${zone_number}`,
    "number_of_nat_gateways": `${number_of_nat_gateways}`,
    "crosswalk":"yes",
});

// Allocate a new VPC with the CIDR range from config file:
const vpc = new awsx.ec2.Vpc(`${vpc_name}`, {
    cidrBlock: vpc_cidr,
  //  numberOfAvailabilityZones: zone_number,
    numberOfNatGateways: number_of_nat_gateways,
    subnets: [
        { type: "public", name: "pulumi-public-web-1", location: {cidrBlock: "10.0.0.0/24",availabilityZone: "us-east-1e" }},
        { type: "public", name: "pulumi-public-web-2", location: {cidrBlock:"10.0.1.0/24", availabilityZone:  "us-east-1e"}},
        { type: "private", name: "pulumi-private-apps-1", location: {cidrBlock:"10.0.2.0/24", availabilityZone:  "us-east-1d"}},
        { type: "private", name: "pulumi-private-apps-2", location: {cidrBlock:"10.0.3.0/25", availabilityZone:  "us-east-1e"}},
        { type: "private", name: "pulumi-private-databases", location: {cidrBlock:"10.0.3.128/25", availabilityZone:  "us-east-1f"}},   
    ]
});

// Export a few resulting fields to make them easy to use:
export const pulumi_vpc_name = vpc_name;
export const pulumi_vpc_id = vpc.id;
//export const pulumi_vpc_az_zones = zone_number;
export const pulumi_vpc_cidr = vpc_cidr;
export const pulumic_vpc_number_of_nat_gateways = number_of_nat_gateways;
export const pulumi_vpc_private_subnet_ids = vpc.privateSubnetIds;
export const pulumi_vpc_public_subnet_ids = vpc.publicSubnetIds;