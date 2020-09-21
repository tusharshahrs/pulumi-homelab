import pulumi
import pulumi_aws as aws

config = pulumi.Config()
myvpccidrblock = config.require("myvpccidrblock")

network = aws.cloudformation.Stack("pulumi-vpc-cloudformation",
    parameters={
        "VPCCidr": myvpccidrblock,
    },
    
    template_body="""{
  "Parameters" : {
    "VPCCidr" : {
      "Type" : "String",
      "Default" : "10.0.0.0/16",
      "Description" : "Enter the CIDR block for the VPC. Default is 10.0.0.0/16."
    }
  },
  "Resources" : {
    "myVpc": {
      "Type" : "AWS::EC2::VPC",
      "Properties" : {
        "CidrBlock" : { "Ref" : "VPCCidr" },
        "Tags" : [
          {"Key": "Name", "Value": "Primary_CF_VPC"}
        ]
      }
    }
  },
  
  "Outputs": {
    "VpcId": {
      "Value": { "Ref": "myVpc" }
      },
    "VpcCIDR":{
      "Value": { "Ref": "VPCCidr" }
      }
    }
    
  
}

""")

pulumi.export("pulumi-cloudformation-arn", network.id)
pulumi.export("pulumi-cloudformation-vpc-id",network.outputs["VpcId"])
pulumi.export("pulumi-cloudformation-vpc-cidr",network.outputs["VpcCIDR"])
