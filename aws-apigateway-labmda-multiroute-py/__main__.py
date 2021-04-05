"""An AWS Python Pulumi program"""

import json
import pulumi
from pulumi_aws import iam, lambda_, apigateway, s3
from jinja2 import Environment, FileSystemLoader
from pulumi import Output

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

######### LAYERS ###########
 
artifacts_bucket = s3.Bucket('artifacts')
# Upload ffmpeg library to bucket
api_airtable_layer_zip = s3.BucketObject('hello',
    bucket=artifacts_bucket.id,
    source=pulumi.FileAsset("./step_hello/hello.py")
)

######## LAMBDAS ###########
api_airtable = lambda_.Function('api-airtable',
    role=api_lambda_role.arn,
    runtime="python3.8",
    handler="handler.app",
    #layers=[api_airtable_layer.arn],
    code=pulumi.AssetArchive({
        '.': pulumi.FileArchive('./step_hello')
    }),
    timeout=30,
    memory_size=512,
)

api_lambda_permission = lambda_.Permission('api-lambda-permission',
    action="lambda:InvokeFunction",
    principal="apigateway.amazonaws.com",
    function=api_airtable.name)

env = Environment(loader=FileSystemLoader('./'), trim_blocks=True, lstrip_blocks=True)
openapi_spec_template = env.get_template('api.yaml')

marv_api_key = apigateway.ApiKey('marv-internal')

# Start of api.yaml
first_part_swagger_openapi = """
swagger: "2.0"
info:
  version: "2021-03-29T15:07:58Z"
  title: "marv"
basePath: "/dev"
schemes:
  - "https"
paths:"""
# Route 1 start
route_1 = """
  /test:
    post:
      responses: {}
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        passthroughBehavior: "when_no_match"
        type: "AWS_PROXY"
        uri: """

# The lambda invocation arn wil be passed in seperately

# Route 2 start
route_2 = """
  /qa:
    post:
      responses: {}
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        passthroughBehavior: "when_no_match"
        type: "AWS_PROXY"
        uri: """

route_3 = """
  /prod:
    post:
      responses: {}
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        passthroughBehavior: "when_no_match"
        type: "AWS_PROXY"
        uri: """

fullbody=Output.concat(f'{first_part_swagger_openapi}', f'{route_1}',api_airtable.invoke_arn, f'{route_2}',api_airtable.invoke_arn,f'{route_3}',api_airtable.invoke_arn)

pulumi.export("fullbody", fullbody)
api_gateway = apigateway.RestApi(
    resource_name='api-gateway',
    api_key_source='HEADER',
    body = fullbody,
    description="This is the hello python apigateway with lambda integration",
)