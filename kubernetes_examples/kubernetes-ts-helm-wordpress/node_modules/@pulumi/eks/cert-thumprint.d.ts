/// <reference types="node" />
import * as pulumi from "@pulumi/pulumi";
import * as http from "http";
/**
* Get the certificate thumprint of the issuing CA for the TLS enabled URL.
*
* This is used for OIDC provider configuration.
*
* See for more details:
* - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc_verify-thumbprint.html
* - https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html
* - https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/
* - https://medium.com/@marcincuber/amazon-eks-with-oidc-provider-iam-roles-for-kubernetes-services-accounts-59015d15cb0c
* - https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/aws/eks/#enabling-iam-roles-for-service-accounts
*/
export declare function getIssuerCAThumbprint(issuerUrl: pulumi.Input<string>, agent: http.Agent): pulumi.Output<string>;
