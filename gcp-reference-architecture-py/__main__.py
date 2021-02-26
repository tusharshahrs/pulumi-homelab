"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage
from config import getResourceName, subnet_cidr_blocks, project
import network

# creating project name tag
projectName = pulumi.get_project()

# creating stack name tag
stackName = pulumi.get_stack()

commonTags = {
    "project": projectName,
    "stack": stackName,
}

# Create a GCP resource (Storage Bucket)
# With no getresourcename
#bucket = storage.Bucket('shaht-my-bucket', labels=commonTags)
# Expected output: gs://shaht-my-bucket-7477081

bucket = storage.Bucket(getResourceName("shaht-my-bucket"), labels=commonTags)
# Expected output:  gs://gcp-reference-architecture-py-shaht-my-bucket-b89e42f

#bucket = storage.Bucket(getResourceName(), labels=commonTags)
# Expected output: gs://gcp-reference-architecture-py-1d70b6d

#mynetwork = network.Vpc("shaht-vpc", network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
#mynetwork = network.Vpc(getResourceName(), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
mynetwork = network.Vpc(getResourceName("demo-vpc"), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))

my_subnet_names = []
my_subnet_cidrs_blocks = []

my_subnet_names.append(mynetwork.subnets[0].name.apply(lambda subnet: subnet))
my_subnet_names.append(mynetwork.subnets[1].name.apply(lambda subnet: subnet))
my_subnet_names.append(mynetwork.subnets[2].name.apply(lambda subnet: subnet))

my_subnet_cidrs_blocks.append(mynetwork.subnets[0].ip_cidr_range.apply(lambda subnet: subnet))
my_subnet_cidrs_blocks.append(mynetwork.subnets[1].ip_cidr_range.apply(lambda subnet: subnet))
my_subnet_cidrs_blocks.append(mynetwork.subnets[2].ip_cidr_range.apply(lambda subnet: subnet))

# Export the DNS name of the bucket
pulumi.export('bucket_name', bucket.url)

# Export the vpc information
pulumi.export('vpc_name', mynetwork.network.name)
pulumi.export('network_project', mynetwork.network.project)
pulumi.export('subnets_names',my_subnet_names)
pulumi.export('subnets_cidr_blocks',my_subnet_cidrs_blocks)
