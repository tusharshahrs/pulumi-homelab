"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi import ResourceOptions, Output
from pulumi_gcp import storage, bigtable
from config import getResourceName, subnet_cidr_blocks, project
import network
import postgres
import serverless

import pulumi_random as random

# Name prefix
myname = "demo"

# creating project name tag
projectName = pulumi.get_project()

# creating stack name tag
stackName = pulumi.get_stack()

# common tags.  need to pass in
commonTags = {
    "project": projectName,
    "stack": stackName,
}

# Create a GCP resource (Storage Bucket)
# With no getresourcename
#bucket = storage.Bucket('shaht-my-bucket', labels=commonTags)
# Expected output: gs://shaht-my-bucket-7477081

bucket = storage.Bucket(getResourceName(f"{myname}-bucket"), labels=commonTags)
# Expected output:  gs://gcp-reference-architecture-py-shaht-my-bucket-b89e42f

#bucket = storage.Bucket(getResourceName(), labels=commonTags)
# Expected output: gs://gcp-reference-architecture-py-1d70b6d

#mynetwork = network.Vpc("shaht-vpc", network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
#mynetwork = network.Vpc(getResourceName(), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))

# creates vpc
mynetwork = network.Vpc(getResourceName(f"{myname}-vpc"), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
# creates postgres sql server in cloud
mydatabase = postgres.Database(getResourceName(f"{myname}-database"), postgres.DbArgs(private_network=mynetwork.id, tags = commonTags))
# creates google cloud function
myfunction = serverless.Function(getResourceName(f"{myname}-function"), serverless.FuncArgs(tags=commonTags))

#  Creating subnet and cidr block outputs
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
pulumi.export('network_vpc_name', mynetwork.network.name)
# Export the subnet names and cidr blocks
pulumi.export('network_subnets_names',my_subnet_names)
pulumi.export('network_subnets_cidr_blocks',my_subnet_cidrs_blocks)
pulumi.export('database_instance', mydatabase.sql.name)
pulumi.export('database_user', mydatabase.users.name)
pulumi.export('database_user_password', mydatabase.users.password)
pulumi.export('database_name', mydatabase.database.name)

pulumi.export('function_bucket_name', myfunction.bucket.name)
#pulumi.export('function_bucket_object_name', myfunction.bucket_object.name)
pulumi.export('function_name', myfunction.function.name)
pulumi.export('function_trigger_url', myfunction.function.https_trigger_url)