import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("demo-bucket", {});

/*const awsGlueCatalogDatabase = new aws.glue.CatalogDatabase("demo_aws_glue_catalog_database", {
    name: "mycatalogdatabase",
});
*/
/*const awsGlueCatalogTable = new aws.glue.CatalogTable("demo_aws_glue_catalog_table", {
    databaseName: awsGlueCatalogDatabase.name,
    name: "mycatalogtable",
});
*/
//const lakeformations = new aws.lakeformation.Resource("demo-lakeformation", {arn: bucket.arn});

//const datalakeuser = new aws.iam.User("demo-datalakeuser");

// Export the resources
//export const bucketName = bucket.id;
//export const glue_database_name = awsGlueCatalogDatabase.name;
//export const glue_database_catalog_name = awsGlueCatalogTable.name;
//export const lakeformations_name = lakeformations.id;
//export const datalakeuser_name = datalakeuser.name;

/*const lakeformation_permissions = new aws.lakeformation.Permissions("demo-lakepermissions", {
 permissions: ["DESCRIBE"],
 principal: datalakeuser.arn,
 database: {
     name: awsGlueCatalogDatabase.name,
 }
});
*/