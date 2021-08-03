"""An AWS Python Pulumi program"""

import pulumi
from pulumi_aws import s3
import pulumi_aws as aws
# Create an AWS resource (S3 Bucket)
awsConfig = pulumi.Config("aws")
awsRegion = awsConfig.get("region")

#bucket = s3.Bucket('my-bucket')


if  awsRegion != "us-east-2":
  raise ValueError("provider has bad region")

pulumi.export("aws_region_selected", awsRegion)
# Export the name of the bucket
#pulumi.export('bucket_name', bucket.id)
