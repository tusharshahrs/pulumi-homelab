import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as iam from "./iam";


/* // Creates a datalake user basic policy based on https://docs.aws.amazon.com/lake-formation/latest/dg/cloudtrail-tut-create-lf-user.html
const datalake_user_basic_policy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lakeformation:GetDataAccess",
                "glue:GetTable",
                "glue:GetTables",
                "glue:SearchTables",
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:GetPartitions",
                "lakeformation:GetResourceLFTags",
                "lakeformation:ListLFTags",
                "lakeformation:GetLFTag",
                "lakeformation:SearchTablesByLFTags",
                "lakeformation:SearchDatabasesByLFTags"
            ],
            "Resource": "*"
        }
    ]
}`


// Creates a datalake user basic policy json
// https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler#aws---iam
const my_custom_policy = new aws.iam.Policy("DataLakeBasicPolicyJson", {
    description: "Datalake Basic Policy Json",
    path: "/",
    policy: `${datalake_user_basic_policy}`,
}); */


// https://docs.aws.amazon.com/lake-formation/latest/dg/permissions-reference.html
// aws managed policies
const managedPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/AWSLakeFormationDataAdmin",
    "arn:aws:iam::aws:policy/AWSGlueConsoleFullAccess",
    "arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSLakeFormationCrossAccountManager",
    "arn:aws:iam::aws:policy/AmazonAthenaFullAccess"
];

// Creates a role and attaches the datalakebasic user node IAM managed policies
export function createRole(name: string): aws.iam.Role {
    const role = new aws.iam.Role(`${name}-iamrole`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "ec2.amazonaws.com",
        }),
    });

    let counter = 0;
    for (const policy of managedPolicyArns) {
        // Create RolePolicyAttachment without returning it.
        const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
            { policyArn: policy, role: role },
        );
    }

/*     // Adding Custom Policy for datalake basic
    const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
        { policyArn: my_custom_policy.arn, role: role },
        { dependsOn: my_custom_policy }); */

    return role;
}

// Creates a collection of IAM roles.
export function createRoles(name: string, quantity: number): aws.iam.Role[] {
    const roles: aws.iam.Role[] = [];

    for (let i = 0; i < quantity; i++) {
        roles.push(iam.createRole(`${name}-role-${i}`));
    }

    return roles;
}