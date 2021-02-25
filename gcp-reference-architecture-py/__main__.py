"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage
from config import getResourceName, subnet_cidr_blocks

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
bucket = storage.Bucket('shaht-my-bucket', labels=commonTags)
# Expected output: gs://shaht-my-bucket-7477081

bucket = storage.Bucket(getResourceName("shaht-my-bucket"), labels=commonTags)
# Expected output:  gs://gcp-reference-architecture-py-shaht-my-bucket-b89e42f

bucket = storage.Bucket(getResourceName(), labels=commonTags)
# Expected output: gs://gcp-reference-architecture-py-1d70b6d

# Export the DNS name of the bucket
pulumi.export('bucket_name', bucket.url)
