import pulumi
import pulumi_aws as aws
import pulumi_eks as eks

base_name = "demo"

myekscluster = eks.Cluster(base_name,
    instance_type="t2.micro",
    desired_capacity=2,
    min_size=1,
    max_size=2,
)

mynodegroup = eks.NodeGroup(base_name,
    cluster= myekscluster.name,
    instance_type = "t2.small",
    spot_price = "0.04",
    desired_capacity=3,
    )

pulumi.export("cluster_name", myekscluster.name)
pulumi.export("kubeconfig", myekscluster.kubeconfig)
