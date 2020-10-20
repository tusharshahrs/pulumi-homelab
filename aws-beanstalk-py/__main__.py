"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws

default_bucket = aws.s3.Bucket("defaultBucket")
default_bucket_object = aws.s3.BucketObject("defaultBucketObject",
    bucket=default_bucket.id,
    key="beanstalk/go-v1.zip",
    source=pulumi.FileAsset("beanstalk/python.zip"))

default_application = aws.elasticbeanstalk.Application("myapplication", description="tf-test-description-app")
default_application_version = aws.elasticbeanstalk.ApplicationVersion("defaultApplicationVersion",
    application=default_application.id,
    description="application version",
    bucket=default_bucket.id,
    key=default_bucket_object.id)

pulumi.export("elastic beanstalk s3 bucket", default_bucket.id)
pulumi.export("elastic beanstalk application name", default_application.name)
pulumi.export("elastic beanstalk applicationversions", default_application_version.name)