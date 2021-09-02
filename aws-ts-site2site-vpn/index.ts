import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// importing local configs
const config = new pulumi.Config();
const env = pulumi.getStack()
const name = "demo-site2site";
const vpc_cidr = "10.0.0.0/24"

const baseTags = {
  "Name": `${name}`,
  "cidr_block": `${vpc_cidr}`,
  "crosswalk": "yes",
  "demo": "true",
  "pulumi:Project": pulumi.getProject(),
  "pulumi:Stack": pulumi.getStack(),
  "cost_center": "1234",
}

// Allocate a new VPC with the CIDR range from config file:
const vpc = new awsx.ec2.Vpc(`${name}-vpc`, {
  cidrBlock: vpc_cidr,
  numberOfAvailabilityZones: 3,
  numberOfNatGateways: 1,
  tags: baseTags,
});

// Export a few resulting fields to make them easy to use:
export const vpcs_name = vpc.id;
export const vpcs_id = vpc.id;

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
  tags: {
    Name: `${name}-vpnconnection`,
  },
});

export const vpn_connection_id = vpnconnection.id;

const my_cidrblock_1 = "192.168.11.0/24";
const office = new aws.ec2.VpnConnectionRoute(`${name}-vpnconnectionroute`, {
  
  destinationCidrBlock: my_cidrblock_1,
  vpnConnectionId: vpnconnection.id,

});

/*const office = new aws.ec2.VpnConnectionRoute(`${name}-vpnconnectionroute1`, {
  
  destinationCidrBlock: my_cidrblock_1,
  vpnConnectionId: vpnconnection.id,

},{deleteBeforeReplace: true});
*/

export const office_vpnconnectionroute_id = office.id;
export const office_vpnconnectionroute_vpnconnectionid = office.vpnConnectionId;
export const office_vpnconnectionroute_urn = office.urn;