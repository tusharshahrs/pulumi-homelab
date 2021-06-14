import { AwsGuard } from "@pulumi/awsguard";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

new AwsGuard({ 
    all: "disabled",
    acmCertificateExpiration: { maxDaysUntilExpiration: 10}
    },
)