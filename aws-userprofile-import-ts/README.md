## Create a IAM user in aws console.

Created the following *iam user* in the aws console:  **demotest-forimport** 
Screen shot of [demotest-forimport](https://share.getcloudapp.com/X6uABAYw) 

Note: If you have a user that already exist, you can skip this step.

## Current Error when running pulumi import on UserProfile
- [UserProfile Import](https://www.pulumi.com/docs/reference/pkg/aws/iam/userloginprofile/#import)

   ```
    $ pulumi import  aws:iam/userLoginProfile:UserLoginProfile mydemouser demotest-forimport
    Previewing import (dev)

    View Live: https://app.pulumi.com/myuser/aws-userprofile-import-ts/dev/previews/0b4d3ba0-f1ee-44e5-bd09-eaa7df583a54

        Type                         Name                           Plan       Info
    +   pulumi:pulumi:Stack          aws-userprofile-import-ts-dev  create     1 error
    =   └─ aws:iam:UserLoginProfile  mydemouser                     import     2 errors
    
    Diagnostics:
    aws:iam:UserLoginProfile (mydemouser):
        error: aws:iam/userLoginProfile:UserLoginProfile resource 'mydemouser' has a problem: Missing required argument: The argument "pgp_key" is required, but no definition was found.. Examine values at 'UserLoginProfile.PgpKey'.
        error: Preview failed: one or more inputs failed to validate
   ```

Reason for Error:  
 - Since this provider has no method to read the PGP or password information during import, use [ignore_changes](https://www.pulumi.com/docs/intro/concepts/resources/#ignorechanges) argument to ignore them unless password recreation is desired.
 

# Work Around - Pulumi import via Resource Options with Ignore Changes
 - Use the [import resource option](https://www.pulumi.com/docs/intro/concepts/resources/#import) with [ignoreChanges](https://www.pulumi.com/docs/intro/concepts/resources/#ignorechanges) for the pgpKey values
 
 1. Create a directory & cd into it.
    ```
     mkdir aws-userprofile-import-ts
     cd aws-userprofile-import-ts
    ```

 1. Update the package.json to the following:
    ```
      {
    "name": "aws-userprofile-import-ts",
    "devDependencies": {
        "@types/node": "^14.0.0"
    },
    "dependencies": {
        "@pulumi/aws": "^4.0.0",
        "@pulumi/pulumi": "^3.0.0"
    }
     }
    ```

1. Install the dependencies
    ```
     npm install
    ```
 
1. Add the following code: 
   ```
        import * as pulumi from "@pulumi/pulumi";
        import * as aws from "@pulumi/aws";


        const mydemouserprofile = new aws.iam.UserLoginProfile("UserLoginProfile", {
        // The user: matches what is in the aws console. 
        user: "demotest-forimport",
        // The pgpKey is a made up value.  As you can see here, it will be ignored.
        pgpKey: "keybase:some_person_that_exists",
        }, {import: "demotest-forimport", ignoreChanges: ["pgpKey"]}); // We are ignoring the pgpKey here.
    ```

1. Run `pulumi up` and the preview **FAILS**
   ```
        pulumi up
        Previewing update (dev)

        View Live: https://app.pulumi.com/shaht/aws-userprofile-import-ts/dev/previews/4a5abd4e-8910-4cdb-8493-359f9de6263f

            Type                         Name                           Plan       Info
            pulumi:pulumi:Stack          aws-userprofile-import-ts-dev             1 error
        =   └─ aws:iam:UserLoginProfile  UserLoginProfile               import     2 errors
        
        Diagnostics:
        pulumi:pulumi:Stack (aws-userprofile-import-ts-dev):
            error: preview failed
        
        aws:iam:UserLoginProfile (UserLoginProfile):
            error: aws:iam/userLoginProfile:UserLoginProfile resource 'UserLoginProfile' has a problem: Missing required argument: The argument "pgp_key" is required, but no definition was found.. Examine values at 'UserLoginProfile.PgpKey'.
            error: Preview failed: one or more inputs failed to validate
   ```

1. If you remove the `ignore_changes` then the **preview** displays
   ```
      Diagnostics:
        aws:iam:UserLoginProfile (UserLoginProfile):
            warning: inputs to import do not match the existing resource; importing this resource will fail
    ```
   and the `pulumi up` will **FAIL**

1. As per pulumi [import on userloginprofile](https://www.pulumi.com/docs/reference/pkg/aws/iam/userloginprofile/#import),
   we have to pass in **ignore_changes** for this to work due to the [upstream pgp issue](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_user_login_profile#import).  When we [import via resource options](https://www.pulumi.com/docs/intro/concepts/resources/#import) and use
   [ignore_changes](https://www.pulumi.com/docs/intro/concepts/resources/#ignorechanges) the preview fails.
   Neither option currently works.