import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


// importing local configs
const config = new pulumi.Config();
const env = pulumi.getStack()
const vpc_name = config.require("vpc_name");
const zone_number = config.requireNumber("zone_number");
const vpc_cidr = config.require("vpc_cidr");
const number_of_nat_gateways = config.requireNumber("number_of_nat_gateways");

const baseTags = {
  "Name": `${vpc_name}`,
  "availability_zones_used": `${zone_number}`,
  "cidr_block": `${vpc_cidr}`,
  "crosswalk": "yes",
  "number_of_nat_gateways": `${number_of_nat_gateways}`,
  "demo": "true",
  "pulumi:Project": pulumi.getProject(),
  "pulumi:Stack": pulumi.getStack(),
  "cost_center": "1234",
}

// Allocate a new VPC with the CIDR range from config file:
const vpc = new awsx.ec2.Vpc(vpc_name, {
  cidrBlock: vpc_cidr,
  numberOfAvailabilityZones: zone_number,
  numberOfNatGateways: number_of_nat_gateways,
  tags: baseTags,

});

// Export a few resulting fields to make them easy to use:
export const vpcs_name = vpc_name;
export const vpcs_id = vpc.id;
//export const vpcs_az_zones = zone_number;
export const vpcs_cidr = vpc_cidr;
//export const vpcs_number_of_nat_gateways = number_of_nat_gateways;
//export const vpcs_private_subnet_ids = vpc.privateSubnetIds;
//export const vpcs_public_subnet_ids = vpc.publicSubnetIds;
//export const vpcs_aws_tags = baseTags;

const name="demo"
const vpngateway = new aws.ec2.VpnGateway(`${name}-vpngateway`, {
  vpcId: vpc.id,
  tags: {
      Name: `${name}-vpngateway`,
  },
});

export const vpn_gateway_id = vpngateway.id;

const customergateway = new aws.ec2.CustomerGateway(`${name}-customergateway`, {
  bgpAsn: "65000",
  ipAddress: "172.83.124.10",
  tags: {
      Name: `${name}-customergateway`,
  },
  type: "ipsec.1",
});

export const customergateway_id = customergateway.id;

const vpnconnection = new aws.ec2.VpnConnection(`${name}-vpnconnection`, {
  vpnGatewayId: vpngateway.id,
  customerGatewayId: customergateway.id,
  type: "ipsec.1",
  staticRoutesOnly: true,
});

export const vpn_connection_id = vpnconnection.id;


const office = new aws.ec2.VpnConnectionRoute(`${name}-vpnconnectionroute`, {
  destinationCidrBlock: "192.168.10.0/24",
  vpnConnectionId: vpnconnection.id,
});

export const office_vpnconnectionroute_id = office.id;
export const office_vpnconnectionroute_vpnconnectionid = office.vpnConnectionId;
export const office_vpnconnectionroute_urn = office.urn;

