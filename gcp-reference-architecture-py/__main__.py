"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage

# creating project name tag
projectName = pulumi.get_project()

# creating stack name tag
stackName = pulumi.get_stack()

commonTags = {
    "project": projectName,
    "stack": stackName,
}
# Create a GCP resource (Storage Bucket)
bucket = storage.Bucket('shaht-my-bucket', labels=commonTags)

# Export the DNS name of the bucket
pulumi.export('bucket_name', bucket.url)
