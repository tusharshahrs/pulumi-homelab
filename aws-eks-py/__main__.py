"""An AWS Python Pulumi program"""

import pulumi
from pulumi_aws import s3
import pulumi_aws as aws
import pulumi_eks as eks


base_name = "tushar"
useast2ohio = aws.Provider("useast2ohio", region="us-east-2")

prov_cluster = eks.Cluster(base_name,
                instance_type="t2.micro",
                provider_credential_opts=aws.config.profile,
                opts=pulumi.ResourceOptions(provider=useast2ohio)
            )

pulumi.export("Cluster_name", prov_cluster.name)
pulumi.export("kubeconfig", prov_cluster.kubeconfig)