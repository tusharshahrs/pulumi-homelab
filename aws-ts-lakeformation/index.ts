import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as iam from "./iam";

const my_name = `demo-datalake`;


const bucket = new aws.s3.Bucket(`${my_name}-bucket`, {});

const awsGlueCatalogDatabase = new aws.glue.CatalogDatabase(`${my_name}-glue-catalog-database`, {
    name: "mycatalogdatabase",
});

const awsGlueCatalogTable = new aws.glue.CatalogTable(`${my_name}-glue-catalog-table`, {
    databaseName: awsGlueCatalogDatabase.name,
    name: "mycatalogtable",
});

const lakeformation_iam_user = new aws.iam.User(`${my_name}-iam-user`);
const lakeformation_datalakeuserbasic_policy = new aws.iam.Policy(`${my_name}-datalakebasic-policy`, {
    description: "DatalakeUserBasic Policy",
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [                
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
                "lakeformation:SearchDatabasesByLFTags",
                "lakeformation:GetDataAccess",
                "lakeformation:GrantPermissions",
                "lakeformation:PutDataLakeSettings",
                "lakeformation:GetDataLakeSettings"],
            Effect: "Allow",
            Resource: "*",
        }],
    }),
});


const lakeformation_iam_user_policy_attachment = new aws.iam.UserPolicyAttachment(`${my_name}-userpolicyattachment`, {
    user: lakeformation_iam_user.name,
    policyArn: lakeformation_datalakeuserbasic_policy.arn,
});

const lakeformation_roles = iam.createRoles(my_name, 1);

const adminpermission_for_datalakesettings = new aws.lakeformation.DataLakeSettings("demo-datalakesettings", {
    admins: 
        [
        lakeformation_iam_user.arn,
        lakeformation_roles[0].arn,
        ],
    createTableDefaultPermissions:[],
    createDatabaseDefaultPermissions: [],

},{dependsOn: lakeformation_iam_user_policy_attachment});

const lakeformations = new aws.lakeformation.Resource("demo-lakeformation", {arn: bucket.arn});


// Export the resources
export const bucket_name = bucket.id;
export const glue_database_name = awsGlueCatalogDatabase.name;
export const glue_database_catalog_table_name = awsGlueCatalogTable.name;
export const lakeformations_name = lakeformations.id;
export const lakeformation_iam_user_name = lakeformation_iam_user.name;
export const lakeformation_role_name = lakeformation_roles[0].name;
export const adminpermission_for_datalakesettings_name = adminpermission_for_datalakesettings;

const lakeformation_permissions = new aws.lakeformation.Permissions("demo-lakepermissions", {
    permissions: ["ALL", "ALTER", "DELETE", "INSERT", "DESCRIBE","DROP", "SELECT"],
    permissionsWithGrantOptions: ["ALL", "ALTER", "DELETE", "INSERT", "DESCRIBE","DROP","SELECT"],
    principal: lakeformation_roles[0].arn,
    table: {
        name: awsGlueCatalogTable.name,
        databaseName: awsGlueCatalogDatabase.name,
    }, 
});