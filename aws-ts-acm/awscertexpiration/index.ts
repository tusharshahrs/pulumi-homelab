import { AwsGuard } from "@pulumi/awsguard";

new AwsGuard({ 
    all: "disabled",
    acmCertificateExpiration: { maxDaysUntilExpiration: 10,}
    },
)
