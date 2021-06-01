import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

let thumbnailer = new aws.lambda.Function("mylambdafunction", {
    handler: "index.handler",
    name: "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC",
    description: "A starter AWS Lambda function.",
    role: "arn:aws:iam::052848974346:role/serverlessrepo-hello-world-helloworldRole-1BJUFYUMD37UT",
    runtime: "nodejs12.x",
    memorySize: 128,
    timeout: 3,
    tags: {["lambda:createdBy"]:"SAM", ["serverlessrepo:semanticVersion"]: "1.0.4",["serverlessrepo:applicationId"]:"arn:aws:serverlessrepo:us-east-1:077246666028:applications/hello-world"}
}, {import: "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC"});
