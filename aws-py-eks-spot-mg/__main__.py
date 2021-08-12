"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import pulumi_eks as eks
from pulumi import ResourceOptions
import iam

role0 = iam.create_role("demo-py-role0")

# Create an EKS cluster.
mycluster = eks.Cluster("demo-py-eks",
            skip_default_node_group = True,
            instance_type = "t3a.medium",
            version = "1.21",
            node_root_volume_size = 10,
            instance_roles=[role0],
            encrypt_root_block_device = True,
            desired_capacity=2,
            min_size=2,
            max_size=5,
            enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"],           
            )

managed_nodegroup0 = eks.ManagedNodeGroup("demo-py-managed-ng0",
   cluster=mycluster.core, # TODO[pulumi/pulumi-eks#483]: Pass cluster directly.
   #capacity_type = "SPOT",
   instance_types=["t3a.medium"],
   node_role=role0,
   opts=ResourceOptions(depends_on=[mycluster])
   )