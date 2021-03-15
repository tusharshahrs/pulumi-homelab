"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws

# Get the AMI
ami = aws.ec2.get_ami(
    owners=['amazon'],
    most_recent=True,
    filters=[aws.ec2.GetAmiFilterArgs(
        name='name',
        values=['amzn2-ami-hvm-2.0.????????-x86_64-gp2'],
    )],
)

pulumi.export("Myami", ami.name)


