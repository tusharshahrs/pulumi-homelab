#pulumi imports
import pulumi
from pulumi.output import Output
import pulumi_aws as aws
from pulumi import export, Config, StackReference

# need this so that later files can read the subnets
config = pulumi.Config()

# reading in vpc StackReference Path from local config
mystackpath = config.get("mystackpath")

# setting the StackReference
mycloudformationvpc = StackReference(f"{mystackpath}")
myvpccidrblock = mycloudformationvpc.require_output("pulumi-cloudformation-vpc-cidr")
myvpcid= mycloudformationvpc.require_output("pulumi-cloudformation-vpc-id")
pulumi_cloudformation_vpc_with_arn = mycloudformationvpc.require_output("pulumi-cloudformation-arn")

# Retrieve public subnet cidrs blocks from local config
public_subnet_cidrs = config.require_object("public_subnets")
# Retrieve private subnet cidrs blocks from local config
private_subnet_cidrs = config.require_object("private_subnets")

def get_aws_az():
    zones = aws.get_availability_zones()
    return zones.names[:3] # Returns availability zones 0, 1, 2.  So total of 3 az's.

zones = get_aws_az()
zone = 3 # 3 availability zones

# Create igw: https://www.pulumi.com/docs/reference/pkg/aws/ec2/internetgateway/
igw = aws.ec2.InternetGateway("pulumi-igw",vpc_id = myvpcid, tags = {"Name":"pulumi-igw", "env":"dev"});

# create public route table for igw: https://www.pulumi.com/docs/reference/pkg/aws/ec2/routetable/#routetableroute 
public_route_table = aws.ec2.RouteTable("pulumi-public-routetable",
    vpc_id=myvpcid,
    routes = [
            aws.ec2.RouteTableRouteArgs(
                cidr_block="0.0.0.0/0",
                gateway_id=igw.id,
                ),
    ],
    tags={"Name":"pulumi-public-routetable","env":"dev"},        
)

public_subnet_ids = []
private_subnet_ids = []

for zone, public_subnet_cidr, private_subnet_cidr in zip(zones, private_subnet_cidrs, public_subnet_cidrs):
    
    #create public subnet https://www.pulumi.com/docs/reference/pkg/aws/ec2/subnet/
    public_subnet = aws.ec2.Subnet(
        f"pulumi-public-subnet-{zone}",
        assign_ipv6_address_on_creation = False,
        vpc_id = myvpcid,
        map_public_ip_on_launch = True,
        cidr_block = public_subnet_cidr,
        availability_zone = zone,
        tags = {"Name": f"pulumi-public-subnet-{zone}"}
    )
    
    # Route table associate between route table and subnet: https://www.pulumi.com/docs/reference/pkg/aws/ec2/routetableassociation/
    aws.ec2.RouteTableAssociation(f"pulumi-public-routetable-{zone}",
        route_table_id = public_route_table.id,
        subnet_id=public_subnet.id,
    )

    # add public_subnet.id to array of public_subnets
    public_subnet_ids.append(public_subnet.id)

    # Elastic IP for nat gateway: not connected yet.
    eip = aws.ec2.Eip(f"pulumi-eip-nat-{zone}", tags={"Name":f"pulumi-eip-nat-{zone}"})
    
     # Nat Gateway, creating one for each public subnet for HA
    nat_gateway = aws.ec2.NatGateway(f"pulumi-natgw-{zone}", subnet_id=public_subnet.id, allocation_id=eip.id,
        tags={"Name": f"pulumi-natgw-{zone}"},
    )
    
    # private subnet creation
    private_subnet = aws.ec2.Subnet(
        f"pulumi-private-subnet-{zone}",
        assign_ipv6_address_on_creation=False,
        vpc_id=myvpcid,
        map_public_ip_on_launch=False,
        cidr_block=private_subnet_cidr,
        availability_zone=zone,
        tags={"Name": f"pulumi-private-subnet-{zone}"},
    )
    
    # Route table associate between route table and subnet: https://www.pulumi.com/docs/reference/pkg/aws/ec2/routetableassociation/
    private_route_table = aws.ec2.RouteTable(
        f"pulumi-private-route-table-{zone}",
        vpc_id=myvpcid,
        #routes=[{"cidr_block": "0.0.0.0/0", "gateway_id": nat_gateway.id}],
        routes = [
            aws.ec2.RouteTableRouteArgs(
                cidr_block="0.0.0.0/0",
                gateway_id=nat_gateway.id,
                ),
                ],
            
        tags={"Name": f"pulumi-private-route-table-{zone}"},
    )

    # Private route table association
    aws.ec2.RouteTableAssociation(f"pulumi-private-route-table-{zone}",
        route_table_id = private_route_table.id,
        subnet_id=private_subnet.id,
    )

    private_subnet_ids.append(private_subnet.id)

export("my vpc id", myvpcid)
export("my vpc cidr block", myvpccidrblock)
export("my cloud formation arn", pulumi_cloudformation_vpc_with_arn)
export("my availability zones", zones)
export("my public subnets", public_subnet_ids)
export("my private subnets", private_subnet_ids)