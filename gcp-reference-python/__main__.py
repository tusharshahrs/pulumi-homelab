"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage
from config import project, getResourceName, subnet_cidr_blocks

projectName =  pulumi.get_project()
stackName = pulumi.get_stack()

commonTags = {
    "project": projectName,
    "stack": stackName,
}
# Create a GCP resource (Storage Bucket)
#bucket = storage.Bucket(getResourceName())
# gcp-reference-python-b9499e9
bucket = storage.Bucket(getResourceName("mybucket"))
# gcp-reference-python-mybucket-7af853b

# Export the DNS name of the bucket
pulumi.export('bucket_id', bucket.id)
