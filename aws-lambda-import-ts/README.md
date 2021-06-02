# AWS Lambda imported into Pulumi

AWS Lambda function created via aws console and then imported into pulumi. 

# Requirements

pulumi 3.0 & node 14.

# Lambda function

Hello-World created via aws console from template

# Work Around for Pulumi import

The following issue: [Import lambda fails because of missing inputs](https://github.com/pulumi/pulumi-aws/issues/1379)

# Pulumi import via Resource Options

  [Pulumi import via Resource Options](https://www.pulumi.com/docs/guides/adopting/import/#pulumi-import-resource-operation)
  ## Running the App

1.  Create a new stack:

    ```
    $ pulumi stack init dev
    ```

1.  Restore NPM dependencies:

    ```
    $ npm install
    ```
    
1. Set the AWS region location to use.  This has to match the same region as the console created lambda function
    
    ```
    $ pulumi config set aws:region us-east-2
    ```

1. AWS Lambda [hello world](https://share.getcloudapp.com/NQuoz4pJ) function created via aws console. 

1. Looked at the [template.yaml file](https://share.getcloudapp.com/9Zud2zw7) in the aws console.

1. Matched up the typescript lambda [inputs](https://www.pulumi.com/docs/reference/pkg/aws/lambda/function/#inputs) with what was in the template.yaml file.

1. The critical step is including the aws resource: **import: "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC"}**   

   ```
    let myfunction = new aws.lambda.Function("mylambdafunction", {
    ...
    ...
    ...
    ...
    }, {import: "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC"});

1. Run `pulumi up` and do NOT select `y` until all the inputs were correct.  Here is it shows


    ```

        View Live: https://app.pulumi.com/myuser/aws-lambda-import-ts/dev/previews/099eaffa-85eb-4cc0-a142-7c26cc91c7c3

           Type                    Name                      Plan       Info
       +   pulumi:pulumi:Stack     aws-lambda-import-ts-dev  create     
       =   └─ aws:lambda:Function  mylambdaimport            import     [diff: -description,tags~name,role]; 1 w
 
      Diagnostics:
       aws:lambda:Function (mylambdaimport):
          warning: inputs to import do not match the existing resource; importing this resource will fail
 

      Do you want to perform this update? details
      + pulumi:pulumi:Stack: (create)
          [urn=urn:pulumi:dev::aws-lambda-import-ts::pulumi:pulumi:Stack::aws-lambda-import-ts-dev]
         = aws:lambda/function:Function: (import)
            [id=serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC]
             [urn=urn:pulumi:dev::aws-lambda-import-ts::aws:lambda/function:Function::mylambdaimport]
             [provider=urn:pulumi:dev::aws-lambda-import-ts::pulumi:providers:aws::default_4_6_0::04da6b54-80e4-46f7-96ec-b56ff0331ba9]
          - description: "A starter AWS Lambda function."
        ~ name       : "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC" => "mylambdaimport-880a573"
          ~ role       : "arn:aws:iam::052848974346:role/serverlessrepo-hello-world-helloworldRole-1BJUFYUMD37UT" => 
                  "arn:aws:lambda:us-east-2:052848974346:function:serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC"
          - tags       : {
              - lambda:createdBy              : "SAM"
              - serverlessrepo:applicationId  : "arn:aws:serverlessrepo:us-east-1:077246666028:applications/hello-world"
              - serverlessrepo:semanticVersion: "1.0.4"
            }

   ``` 

1.  Note the following:  **warning: inputs to import do not match the existing resource; importing this resource will fail**

    The inputs need to match for the error to go away

1.  Keep updating the fields until the error slowly goes away.  We updated all of the following fields:
    
    ```
    handler: "index.handler",
    name: "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC",
    description: "A starter AWS Lambda function.",
    role: "arn:aws:iam::052848974346:role/serverlessrepo-hello-world-helloworldRole-1BJUFYUMD37UT",
    runtime: "nodejs12.x",
    memorySize: 128,
    timeout: 3,
    tags: {["lambda:createdBy"]:"SAM", ["serverlessrepo:semanticVersion"]: "1.0.4",["serverlessrepo:applicationId"]:"arn:aws:serverlessrepo:us-east-1:077246666028:applications/hello-world"}
    ```

1.  No more **warning** messages

    ```
        $ pulumi up
        Previewing update (dev)

        View Live: https://app.pulumi.com/myuser/aws-lambda-import-ts/dev/previews/101d8ccf-25f0-4e63-8314-79e0ebcf1cd0

            Type                    Name                      Plan       
            pulumi:pulumi:Stack     aws-lambda-import-ts-dev             
        =   └─ aws:lambda:Function  mylambdafunction          import     
        
        Resources:
            = 1 to import
            1 unchanged

        Do you want to perform this update? details
        pulumi:pulumi:Stack: (same)
            [urn=urn:pulumi:dev::aws-lambda-import-ts::pulumi:pulumi:Stack::aws-lambda-import-ts-dev]
            = aws:lambda/function:Function: (import)
                [id=serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC]
                [urn=urn:pulumi:dev::aws-lambda-import-ts::aws:lambda/function:Function::mylambdafunction]
                [provider=urn:pulumi:dev::aws-lambda-import-ts::pulumi:providers:aws::default_4_6_0::a1efb29b-8ac5-4598-932e-23508d0c8709]
                description                 : "A starter AWS Lambda function."
                handler                     : "index.handler"
                memorySize                  : 128
                name                        : "serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC"
                packageType                 : "Zip"
                reservedConcurrentExecutions: -1
                role                        : "arn:aws:iam::052848974346:role/serverlessrepo-hello-world-helloworldRole-1BJUFYUMD37UT"
                runtime                     : "nodejs12.x"
                sourceCodeHash              : "HssmIMk6jmnU04in6oz8XsA63ZisBeqVoKHBVUCWJUU="
                tags                        : {
                    lambda:createdBy              : "SAM"
                    serverlessrepo:applicationId  : "arn:aws:serverlessrepo:us-east-1:077246666028:applications/hello-world"
                    serverlessrepo:semanticVersion: "1.0.4"
                }
                tagsAll                     : {
                    lambda:createdBy              : "SAM"
                    serverlessrepo:applicationId  : "arn:aws:serverlessrepo:us-east-1:077246666028:applications/hello-world"
                    serverlessrepo:semanticVersion: "1.0.4"
                }
                timeout                     : 3
                tracingConfig               : {
                    mode      : "PassThrough"
                }

        Do you want to perform this update? yes
        Updating (dev)

        View Live: https://app.pulumi.com/myuser/aws-lambda-import-ts/dev/updates/3

            Type                    Name                      Status       
            pulumi:pulumi:Stack     aws-lambda-import-ts-dev               
        =   └─ aws:lambda:Function  mylambdafunction          imported     
        
        Resources:
            = 1 imported
            1 unchanged

        Duration: 3s
    ```


1. Now I can **destroy** the lambda function via Pulumi

    ```  
        $ pulumi destroy
        Previewing destroy (dev)

        View Live: https://app.pulumi.com/myuser/aws-lambda-import-ts/dev/previews/d9907f42-fa5c-47f5-879f-3fa14ed383a3

            Type                    Name                      Plan       
        -   pulumi:pulumi:Stack     aws-lambda-import-ts-dev  delete     
        -   └─ aws:lambda:Function  mylambdafunction          delete     
        
        Resources:
            - 2 to delete

        Do you want to perform this destroy? details
        - aws:lambda/function:Function: (delete)
            [id=serverlessrepo-hello-world-helloworld-yBIdZSWEGSbC]
            [urn=urn:pulumi:dev::aws-lambda-import-ts::aws:lambda/function:Function::mylambdafunction]
            [provider=urn:pulumi:dev::aws-lambda-import-ts::pulumi:providers:aws::default_4_6_0::a1efb29b-8ac5-4598-932e-23508d0c8709]
        - pulumi:pulumi:Stack: (delete)
            [urn=urn:pulumi:dev::aws-lambda-import-ts::pulumi:pulumi:Stack::aws-lambda-import-ts-dev]

        Do you want to perform this destroy? yes
        Destroying (dev)

        View Live: https://app.pulumi.com/myuser/aws-lambda-import-ts/dev/updates/4

            Type                    Name                      Status      
        -   pulumi:pulumi:Stack     aws-lambda-import-ts-dev  deleted     
        -   └─ aws:lambda:Function  mylambdafunction          deleted     
        
        Resources:
            - 2 deleted
    ```