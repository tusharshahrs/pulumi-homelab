import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myVpc = new aws.ec2.Vpc("demo-myVpc", {
    cidrBlock: "172.16.0.0/16",
    tags: {
      Name: "Darshan",
    },
  });

  const mySubnet = new aws.ec2.Subnet("demo-mySubnet", {
    vpcId: myVpc.id,
    cidrBlock: "172.16.10.0/24",
    availabilityZone: "us-east-2a",
    tags: {
      Name: "Darshan",  
      },
  });

  const Instance = new aws.ec2.Instance("demo-Instance", {
    ami: "ami-020ae06fdda6a0f66",
    instanceType: "t3.micro",
    subnetId: mySubnet.id,
  });

  export const my_vpc = myVpc.id;
  export const my_vpc_cidr_block = myVpc.cidrBlock;
  export const my_vpc_cidr_tags = myVpc.tags;
  export const my_subnet = mySubnet.id;
  export const my_subnet_cidr_block = mySubnet.cidrBlock;
  export const my_subnet_tags = mySubnet.tags;
  export const my_instance_ami = Instance.ami;
  export const my_instance_id = Instance.id;