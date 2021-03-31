"""An AWS Python Pulumi program"""

import json
import pulumi
from pulumi_aws import iam, lambda_, apigateway, s3, kms
from jinja2 import Environment, FileSystemLoader

"""# Create an AWS resource (S3 Bucket)
bucket = s3.Bucket('my-bucket')

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)
"""

######### IAM ###########
api_lambda_role = iam.Role("shaht-lambdaRole",
                           assume_role_policy=json.dumps({
                               "Version": "2012-10-17",
                               "Statement": [{
                                   "Action": "sts:AssumeRole",
                                   "Principal": {
                                       "Service": "lambda.amazonaws.com",
                                   },
                                   "Effect": "Allow",
                                   "Sid": "",
                               }]
                           }))
 
api_lambda_role_policy = iam.RolePolicy('shaht-lambda-api-iam-policy',
    role=api_lambda_role.id,
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "*"
            }
        ]
    })
)


# KMS
mykey = kms.Key("shaht-mykey",
    description="This key is used to encrypt bucket objects",
    deletion_window_in_days=7)

######### LAYERS ###########
 
artifacts_bucket = s3.Bucket('artifacts',server_side_encryption_configuration=s3.BucketServerSideEncryptionConfigurationArgs(
    rule=s3.BucketServerSideEncryptionConfigurationRuleArgs(
        apply_server_side_encryption_by_default=s3.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs(
            kms_master_key_id=mykey.arn,
            sse_algorithm="aws:kms",
        ),
    ),
))

# Upload ffmpeg library to bucket
api_airtable_layer_zip = s3.BucketObject('api-airtable-layer.zip',
    bucket=artifacts_bucket.id,
    server_side_encryption="aws:kms",
    source=pulumi.FileAsset("./api-airtable-layer.zip")
)

api_airtable_layer = lambda_.LayerVersion('api-airtable-layer',
    s3_bucket=artifacts_bucket.id,
    s3_key=api_airtable_layer_zip.key,
    layer_name='api-airtable-layer',
    compatible_runtimes=['python3.8'],
)

######## LAMBDAS ###########
api_airtable = lambda_.Function('api-airtable',
    role=api_lambda_role.arn,
    runtime="python3.8",
    handler="handler.app",
    layers=[api_airtable_layer.arn],
    code=pulumi.AssetArchive({
        '.': pulumi.FileArchive('./api-airtable-layer.zip')
    }),
    timeout=30,
    memory_size=512,
)

api_lambda_permission = lambda_.Permission('api-lambda-permission',
    action="lambda:InvokeFunction",
    principal="apigateway.amazonaws.com",
    function=api_airtable)

env = Environment(loader=FileSystemLoader('./'), trim_blocks=True, lstrip_blocks=True)
openapi_spec_template = env.get_template('api.yaml')

marv_api_key = apigateway.ApiKey('marv-internal')

api_gateway = apigateway.RestApi('api-gateway',
    body=openapi_spec_template.render({'api_airtable_invoke_arn': api_airtable.arn}),
    api_key_source='HEADER',
    opts=pulumi.ResourceOptions(depends_on=[api_airtable])
)


pulumi.export("api_lambda_role_name", api_lambda_role.name)
pulumi.export("api_lambda_role_id", api_lambda_role.id)
pulumi.export("api_lambda_role_arn", api_lambda_role.arn)

pulumi.export("api_lambda_role_policy_name", api_lambda_role_policy.name)
pulumi.export("api_lambda_role_policy_id", api_lambda_role_policy.id)
# Export the name of the bucket
pulumi.export('bucket_name', artifacts_bucket.id)
pulumi.export('api_airtable_layer_zip_id', api_airtable_layer_zip.id)

pulumi.export('api_airtable_layer_arn', api_airtable_layer.arn)
pulumi.export('api_airtable_layer_id', api_airtable_layer.id)

pulumi.export('api_airtable_id', api_airtable.id)

pulumi.export('api_airtable_name', api_airtable.name)


pulumi.export('api_lambda_permission_name', api_lambda_permission.id)


pulumi.export('marv_api_key_name', marv_api_key.name)
pulumi.export('marv_api_key_id', marv_api_key.id)
