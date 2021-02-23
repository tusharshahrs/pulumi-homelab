"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage
from config import project, getResourceName

projectName =  pulumi.get_project()
stackName = pulumi.get_stack()

commonTags = {
    "project": projectName,
    "stack": stackName,
}
# Create a GCP resource (Storage Bucket)
bucket = storage.Bucket(getResourceName())

# Export the DNS name of the bucket
pulumi.export('bucket_id', bucket.id)
