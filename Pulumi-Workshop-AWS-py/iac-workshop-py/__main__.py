"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import mimetypes
import os
import json

bucket = aws.s3.Bucket(
    "shaht-website-bucket",
    website=aws.s3.BucketWebsiteArgs(
        index_document="index.html",
    ),
)

content_dir = "www"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    mime_type, _ = mimetypes.guess_type(filepath)
    obj = aws.s3.BucketObject(
        file,
        bucket=bucket.id,
        source=pulumi.FileAsset(filepath),
        content_type=mime_type,
        opts=pulumi.ResourceOptions(parent=bucket)
    )

pulumi.export("bucket_name", bucket.bucket)