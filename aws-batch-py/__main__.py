import pulumi
import pulumi_aws as aws

ecs_instance_role_role = aws.iam.Role("ecsInstanceRoleRole", assume_role_policy="""{
    "Version": "2012-10-17",
    "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
        "Service": "ec2.amazonaws.com"
        }
    }
    ]
}
""")
ecs_instance_role_role_policy_attachment = aws.iam.RolePolicyAttachment("ecsInstanceRoleRolePolicyAttachment",
    role=ecs_instance_role_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role")
ecs_instance_role_instance_profile = aws.iam.InstanceProfile("ecsInstanceRoleInstanceProfile", role=ecs_instance_role_role.name)
aws_batch_service_role_role = aws.iam.Role("awsBatchServiceRoleRole", assume_role_policy="""{
    "Version": "2012-10-17",
    "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
        "Service": "batch.amazonaws.com"
        }
    }
    ]
}
""")
aws_batch_service_role_role_policy_attachment = aws.iam.RolePolicyAttachment("awsBatchServiceRoleRolePolicyAttachment",
    role=aws_batch_service_role_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole")
sample_vpc = aws.ec2.Vpc("sampleVpc", cidr_block="10.1.0.0/16")
sample_security_group = aws.ec2.SecurityGroup("sampleSecurityGroup",
    vpc_id=sample_vpc.id,
    egress=[aws.ec2.SecurityGroupEgressArgs(
        from_port=0,
        to_port=0,
        protocol="-1",
        cidr_blocks=["0.0.0.0/0"],
    )])
sample_subnet = aws.ec2.Subnet("sampleSubnet",
    vpc_id=sample_vpc.id,
    cidr_block="10.1.1.0/24")
sample_compute_environment = aws.batch.ComputeEnvironment("sampleComputeEnvironment",
    #compute_environment_name="sample",
    compute_environment_name_prefix = "mystack_compute_env-",
    compute_resources=aws.batch.ComputeEnvironmentComputeResourcesArgs(
        instance_role=ecs_instance_role_instance_profile.arn,
        instance_types=["c4.large"],
        max_vcpus=16,
        min_vcpus=0,
        security_group_ids=[sample_security_group.id],
        subnets=[sample_subnet.id],
        type="EC2",
    ),
    service_role=aws_batch_service_role_role.arn,
    type="MANAGED",
    #opts=pulumi.ResourceOptions(depends_on=[aws_batch_service_role_role_policy_attachment], delete_before_replace=True) )
    opts=pulumi.ResourceOptions(depends_on=[aws_batch_service_role_role_policy_attachment]) )

pulumi.export("Batch_name", sample_compute_environment.id)