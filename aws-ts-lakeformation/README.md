
# AWS Lake Formation Permissions with S3, Glue, Iam User, IAM Roles.

AWS Lake Formation Permissions with S3, Glue, Iam User, IAM Roles.  This is a workaround formation
[pulumi-aws issue # 1531](https://github.com/pulumi/pulumi-aws/issues/1531)

## Deployment

1. Initialize a new stack called: `vpc-fargate` via [pulumi stack init](https://www.pulumi.com/docs/reference/cli/pulumi_stack_init/).
      ```bash
      pulumi stack init vpc-fargate-dev
      ```
1. Now, install dependencies.  Note that the package.json has *pulumi-aws* pinned at 3.36.0.  
    Once you switch to *4.2.0* and above you will hit the following type of error:

     ```bash
     error: aws:lakeformation/permissions:Permissions resource 'demo-lakepermissions' has a problem: ExactlyOne: "table_with_columns": only one of `catalog_resource,data_location,database,table,table_with_columns` can be specified, but `catalog_resource,database` were specified.. Examine values at 'Permissions.TableWithColumns'.
     ```
   
     ```bash
     npm install
     ```
1. View the current config settings. This will be empty.
   ```bash
   pulumi config
   ```
   ```bash
   KEY                     VALUE
   ```
1. Populate the config.

   Here are aws [endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html)
   ```bash
   pulumi config set aws:region us-east-2 # any valid aws region endpoint

1.  Run **pulumi up**
  
   ```bash
   pulumi up -y
   ```

   Results
   ```bash
    Previewing update (dev)

      View Live: https://app.pulumi.com/myuser/aws-ts-lakeformation/dev/previews/f6e768be-fc44-4b68-908f-ac3efbaa80e2

         Type                                   Name                                 Plan       Info
      +   pulumi:pulumi:Stack                    aws-ts-lakeformation-dev             create..     Version 3.11.0 referenced at node_modules/@pulumi/pulumi/package.json
      +   ├─ aws:iam:User                        demo-datalake-iam-user               create     
      +   pulumi:pulumi:Stack                    aws-ts-lakeformation-dev             create     3 messages
      +   ├─ aws:iam:Policy                      demo-datalake-datalakebasic-policy   create     
      +   ├─ aws:glue:CatalogDatabase            demo-datalake-glue-catalog-database  create     
      +   ├─ aws:iam:Role                        demo-datalake-role-0-iamrole         create     
      +   ├─ aws:iam:UserPolicyAttachment        demo-datalake-userpolicyattachment   create     
      +   ├─ aws:glue:CatalogTable               demo-datalake-glue-catalog-table     create     
      +   ├─ aws:lakeformation:Resource          demo-lakeformation                   create     
      +   ├─ aws:lakeformation:DataLakeSettings  demo-datalakesettings                create     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-4        create     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-1        create     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-0        create     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-3        create     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-2        create     
      +   └─ aws:lakeformation:Permissions       demo-lakepermissions                 create     
      
      Diagnostics:
      pulumi:pulumi:Stack (aws-ts-lakeformation-dev):
         Found incompatible versions of @pulumi/pulumi. Differing major versions are not supported.
            Version 2.25.2+dirty referenced at node_modules/@pulumi/aws/node_modules/@pulumi/pulumi/package.json
            Version 3.11.0 referenced at node_modules/@pulumi/pulumi/package.json
      

      Do you want to perform this update? yes
      Updating (dev)

      View Live: https://app.pulumi.com/myuser/aws-ts-lakeformation/dev/updates/102

         Type                                   Name                                 Status       Info
      +   pulumi:pulumi:Stack                    aws-ts-lakeformation-dev             creating.      Version 3.11.0 referenced at node_modules/@pulumi/pulumi/package.json
      +   pulumi:pulumi:Stack                    aws-ts-lakeformation-dev             creating..     Version 3.11.0 referenced at node_modules/@pulumi/pulumi/package.json
      +   ├─ aws:s3:Bucket                       demo-datalake-bucket                 created     
      +   ├─ aws:glue:CatalogDatabase            demo-datalake-glue-catalog-database  created     
      +   ├─ aws:iam:Policy                      demo-datalake-datalakebasic-policy   created     
      +   ├─ aws:iam:Role                        demo-datalake-role-0-iamrole         created     
      +   ├─ aws:glue:CatalogTable               demo-datalake-glue-catalog-table     created     
      +   ├─ aws:iam:UserPolicyAttachment        demo-datalake-userpolicyattachment   created     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-4        created     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-1        created     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-2        created     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-3        created     
      +   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-0        created     
      +   ├─ aws:lakeformation:DataLakeSettings  demo-datalakesettings                created     
      +   ├─ aws:lakeformation:Permissions       demo-lakepermissions                 created     
      +   └─ aws:lakeformation:Resource          demo-lakeformation                   created     
      
      Diagnostics:
      pulumi:pulumi:Stack (aws-ts-lakeformation-dev):
         Found incompatible versions of @pulumi/pulumi. Differing major versions are not supported.
            Version 2.25.2+dirty referenced at node_modules/@pulumi/aws/node_modules/@pulumi/pulumi/package.json
            Version 3.11.0 referenced at node_modules/@pulumi/pulumi/package.json
      
      Outputs:
         adminpermission_for_datalakesettings_name: {
            admins                          : [
                  [0]: "arn:aws:iam::052848974346:role/demo-datalake-role-0-iamrole-8f83315"
                  [1]: "arn:aws:iam::052848974346:user/demo-datalake-iam-user-472b7fb"
            ]
            id                              : "571039201"
            urn                             : "urn:pulumi:dev::aws-ts-lakeformation::aws:lakeformation/dataLakeSettings:DataLakeSettings::demo-datalakesettings"
         }
         bucket_name                              : "demo-datalake-bucket-7e684b4"
         glue_database_catalog_table_name         : "mycatalogtable"
         glue_database_name                       : "mycatalogdatabase"
         lakeformation_iam_user_name              : "demo-datalake-iam-user-472b7fb"
         lakeformation_role_name                  : "demo-datalake-role-0-iamrole-8f83315"
         lakeformations_name                      : "arn:aws:s3:::demo-datalake-bucket-7e684b4"

      Resources:
         + 16 created

      Duration: 17s
   ```

1. Clean up the stack

    ```bash
    pulumi destroy -y
    ```
   
   Results
   ```bash
   Previewing destroy (dev)

   View Live: https://app.pulumi.com/myuser/aws-ts-lakeformation/dev/previews/4773fa23-f663-47b2-ac34-da063da341d7

      Type                                   Name                                 Plan       
      pulumi:pulumi:Stack                    aws-ts-lakeformation-dev                        
   -   ├─ aws:lakeformation:DataLakeSettings  demo-datalakesettings                delete     
   -   pulumi:pulumi:Stack                    aws-ts-lakeformation-dev             delete     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-1        delete     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-4        delete     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-2        delete     
   -   ├─ aws:glue:CatalogTable               demo-datalake-glue-catalog-table     delete     
   -   ├─ aws:iam:UserPolicyAttachment        demo-datalake-userpolicyattachment   delete     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-0        delete     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-3        delete     
   -   ├─ aws:lakeformation:Resource          demo-lakeformation                   delete     
   -   ├─ aws:iam:Policy                      demo-datalake-datalakebasic-policy   delete     
   -   ├─ aws:glue:CatalogDatabase            demo-datalake-glue-catalog-database  delete     
   -   ├─ aws:s3:Bucket                       demo-datalake-bucket                 delete     
   -   ├─ aws:iam:Role                        demo-datalake-role-0-iamrole         delete     
   -   └─ aws:iam:User                        demo-datalake-iam-user               delete     
   
   Outputs:
   - adminpermission_for_datalakesettings_name: {
         - admins                          : [
         -     [0]: "arn:aws:iam::052848974346:role/demo-datalake-role-0-iamrole-8f83315"
         -     [1]: "arn:aws:iam::052848974346:user/demo-datalake-iam-user-472b7fb"
         ]
         - id                              : "571039201"
         - urn                             : "urn:pulumi:dev::aws-ts-lakeformation::aws:lakeformation/dataLakeSettings:DataLakeSettings::demo-datalakesettings"
      }
   - bucket_name                              : "demo-datalake-bucket-7e684b4"
   - glue_database_catalog_table_name         : "mycatalogtable"
   - glue_database_name                       : "mycatalogdatabase"
   - lakeformation_iam_user_name              : "demo-datalake-iam-user-472b7fb"
   - lakeformation_role_name                  : "demo-datalake-role-0-iamrole-8f83315"
   - lakeformations_name                      : "arn:aws:s3:::demo-datalake-bucket-7e684b4"

   Resources:
      - 16 to delete

   Destroying (dev)

   View Live: https://app.pulumi.com/myuser/aws-ts-lakeformation/dev/updates/103

      Type                                   Name                                 Status       
      pulumi:pulumi:Stack                    aws-ts-lakeformation-dev                          
   -   ├─ aws:lakeformation:DataLakeSettings  demo-datalakesettings                deleted      
   -   ├─ aws:lakeformation:Permissions       demo-lakepermissions                 deleted     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-2        deleted     
   -   ├─ aws:lakeformation:Resource          demo-lakeformation                   deleted     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-3        deleted     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-4        deleted     
   -   ├─ aws:iam:UserPolicyAttachment        demo-datalake-userpolicyattachment   deleted     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-0        deleted     
   -   ├─ aws:iam:RolePolicyAttachment        demo-datalake-role-0-policy-1        deleted     
   -   ├─ aws:glue:CatalogTable               demo-datalake-glue-catalog-table     deleted     
   -   ├─ aws:glue:CatalogDatabase            demo-datalake-glue-catalog-database  deleted     
   -   ├─ aws:iam:Policy                      demo-datalake-datalakebasic-policy   deleted     
   -   ├─ aws:iam:Role                        demo-datalake-role-0-iamrole         deleted     
   -   ├─ aws:s3:Bucket                       demo-datalake-bucket                 deleted     
   -   └─ aws:iam:User                        demo-datalake-iam-user               deleted     
   
   Outputs:
   - adminpermission_for_datalakesettings_name: {
         - admins                          : [
         -     [0]: "arn:aws:iam::052848974346:role/demo-datalake-role-0-iamrole-8f83315"
         -     [1]: "arn:aws:iam::052848974346:user/demo-datalake-iam-user-472b7fb"
         ]
         - id                              : "571039201"
         - urn                             : "urn:pulumi:dev::aws-ts-lakeformation::aws:lakeformation/dataLakeSettings:DataLakeSettings::demo-datalakesettings"
      }
   - bucket_name                              : "demo-datalake-bucket-7e684b4"
   - glue_database_catalog_table_name         : "mycatalogtable"
   - glue_database_name                       : "mycatalogdatabase"
   - lakeformation_iam_user_name              : "demo-datalake-iam-user-472b7fb"
   - lakeformation_role_name                  : "demo-datalake-role-0-iamrole-8f83315"
   - lakeformations_name                      : "arn:aws:s3:::demo-datalake-bucket-7e684b4"

   Resources:
      - 16 deleted

   Duration: 6s
   ```