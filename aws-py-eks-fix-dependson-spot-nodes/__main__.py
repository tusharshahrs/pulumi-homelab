"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws
from pulumi_aws.iam import instance_profile
import pulumi_eks as eks
import json

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
role1 = create_role('demo-my-worker-role1')
role2 = create_role('demo-my-worker-role2')
role3 = create_role('demo-my-worker-role3')

instance_profile_1 = aws.iam.InstanceProfile('demo-my-instance-profile1-managed-ng', role=role1)
instance_profile_2 = aws.iam.InstanceProfile('demo-my-instance-profile2-fixed-ng', role=role2)
instance_profile_3 = aws.iam.InstanceProfile('demo-my-instance-profile2-spot-ng', role=role3)


cluster = eks.Cluster('demo-my-cluster',
        skip_default_node_group=True,
        instance_roles=[role1, role2, role3],
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

# Create an explicit AWS managed node group using a cluster as input and the
# initial API.

managed_node_group = eks.ManagedNodeGroup("demo-my-managed-ng",
                                           cluster=cluster.core, # TODO[pulumi/pulumi-eks#483]: Pass cluster directly.
                                           node_role_arn=role1.arn,
                                           scaling_config=aws.eks.NodeGroupScalingConfigArgs(
                                              desired_size=2,
                                              min_size=1,
                                              max_size=3,
                                           ),
                                           disk_size=20,
                                           instance_types=["t3a.small"],
                                           labels={"ondemand": "true"},
                                           tags={"org": "pulumi"},
                                           opts=pulumi.ResourceOptions(parent=cluster))

"""
fixed_node_group = eks.NodeGroup('demo-my-cluster-ng-fixed',
                                 cluster=cluster.core,
                                 instance_type='t3a.medium',
                                 desired_capacity=2,
                                 min_size=1,
                                 max_size=3,
                                 labels={'ondemand': 'true'},
                                 instance_profile=instance_profile_2,
                                 opts=pulumi.ResourceOptions(parent=cluster)
                                 )

"""
# Now create a preemptible node group, using spot pricing, for our variable, ephemeral workloads.
"""
spot_node_group = eks.NodeGroup('demo-my-cluster-ng-spot',
                                cluster=cluster.core,
                                instance_type='t3a.large',
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
                                instance_profile=instance_profile_3,
                                opts=pulumi.ResourceOptions(parent=cluster)
                                )
"""
pulumi.export('kubeconfig', cluster.kubeconfig)
