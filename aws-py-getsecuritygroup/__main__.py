"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws

# Retrieve the Default VPC
defaultvpc = aws.ec2.get_vpc(default=True)

# Retrieve the Default Security Group
#default_sg = aws.ec2.get_security_group(name='default')
defaultsg = aws.ec2.get_security_group(name='default')

pulumi.export("default_vpc", defaultvpc.id)
pulumi.export("default_securitygroup_name", defaultsg.name)
pulumi.export("default_securitygroup_id", defaultsg.id)