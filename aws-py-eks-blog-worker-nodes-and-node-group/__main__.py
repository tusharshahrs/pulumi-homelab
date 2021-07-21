"""An AWS Python Pulumi program"""
import pulumi
import pulumi_aws as aws
import pulumi_eks as eks
import json

from pulumi import Config, StackReference

"""
# read local config settings - network
config = Config()
# reading in vpc StackReference Path from local config
mystackpath = config.require("networkingstackpath")
# setting the StackReference
mycrosswalkvpc = StackReference(mystackpath)
vpcid = mycrosswalkvpc.require_output("pulumi_vpc_id")
vpc_private_subnets_ids = mycrosswalkvpc.require_output("pulumi_vpc_private_subnet_ids")
vpc_public_subnets_ids = mycrosswalkvpc.require_output("pulumi_vpc_public_subnet_ids")
"""

# Per NodeGroup IAM: each NodeGroup will bring its own, specific instance role and profile.
managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"]

# Creates a role and attaches the EKS worker node IAM managed policies. Used a few times below,
# to create multiple roles, so we use a function to avoid repeating ourselves.
def create_role(name):
    role = aws.iam.Role(name,
        assume_role_policy = json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Sid": "AllowAssumeRole",
                "Effect": "Allow",
                "Principal": {"Service": "ec2.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }),
    )
    counter = 0
    for policy in managed_policy_arns:
        rpa = aws.iam.RolePolicyAttachment(f'{name}-policy-{counter}',
            aws.iam.RolePolicyAttachmentArgs(
                policy_arn = policy,
                role = role,
            )
        )
        counter = counter + 1
    return role

# Now create the roles and instance profiles for the two worker groups.
role1 = create_role('my-worker-role1')
role2 = create_role('my-worker-role2')

instance_profile_1 = aws.iam.InstanceProfile('my-instance-profile1',
    aws.iam.InstanceProfileArgs(role = role1))
instance_profile_2 = aws.iam.InstanceProfile('my-instance-profile2',
    aws.iam.InstanceProfileArgs(role = role2))


# Create an EKS cluster with the default configuration.
cluster = eks.Cluster('my-cluster',
        #vpc_id=vpcid,
        #private_subnet_ids=vpc_private_subnets_ids,
        #public_subnet_ids=vpc_public_subnets_ids,
        skip_default_node_group=True,
        instance_roles=[role1, role2],
        instance_type="t3a.medium",
        encrypt_root_block_device=True,
        version="1.20",
        enabled_cluster_log_types = [
            'api',
            'audit',
            'authenticator',
            'scheduler',
            'controllerManager'
        ]
)

# First, create a node group for fixed compute.
fixed_node_group = eks.NodeGroup('my-cluster-ng1',
                                 cluster=cluster.core,
                                 instance_type='t3a.medium',
                                 desired_capacity=2,
                                 min_size=1,
                                 max_size=3,
                                 labels={'ondemand': 'true'},
                                 instance_profile=instance_profile_1,
                                 opts=pulumi.ResourceOptions(parent=cluster)
                                 )

# Now create a preemptible node group, using spot pricing, for our variable, ephemeral workloads.

spot_node_group = eks.NodeGroup('my-cluster-ng2',
                                cluster=cluster.core,
                                instance_type='t3a.small',
                                desired_capacity=2,
                                spot_price='0.10',
                                min_size=2,
                                max_size=4,
                                labels={'preemptible': 'true'},
                                taints={
                                    'special': {
                                        'value': 'true',
                                        'effect': 'NoSchedule',
                                    },
                                },
                                instance_profile=instance_profile_2,
                                opts=pulumi.ResourceOptions(
                                    parent=cluster)
                                )

pulumi.export('kubeconfig', cluster.kubeconfig)
