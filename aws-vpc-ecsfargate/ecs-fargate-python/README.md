# Using Pulumi NGINX on AWS ECS Fargate using Python with a vpc built in Typescript

### What Is This?

ngxin on aws ecs fargate using `python` uses a vpc built via [crosswalk](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  
The VPC is built in `typescript`

### Why would you do this?  
An example showing that you can easily infrastructure written in a different language than the one you are used to.  The vpc outputs from vpc-crosswalk-ts folder are used as inputs via [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies)

### Where are the settings? 
 The settings are in `Pulumi`.stackname`.yaml`
 As a reference, we have included: `Pulumi.aws-fargate-dev.yaml`
 You will be creating a new file that holds your configs

### Mandatory: AWS Console Fix for Tags:

This is necessary so that the tags work properly in ecs
[Tagging your Amazon ECS resources](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-using-tags.html)

As per AWS:  `You must opt in to the new Amazon Resource Name (ARN) and resource identifier (ID) formats.`

This has to be done per region until AWS enables it as default across the board(April 1, 2021).

AWS Console -> Elastic Container Service ->  Account Settings -> 

BEFORE
```
Resource                My IAM user or role account settings 
Container Instance      Undefined
Service                 Undefined
Task                    Undefined
```

AFTER
```
Resource                My IAM user or role account settings 
Container Instance      Enabled
Service                 Enabled
Task                    Enabled
```

### Creating a new `Pulumi`.stackname`.yaml`

 1. Initialize a new stack called: `ecs-fargate-dev` via [pulumi config](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/). 
      ```
      $ pulumi stack init ecs-fargate-dev
      ```

2. View the current config settings. This will be empty.
   ```
   $ pulumi config
   ```
   ```
   KEY                     VALUE
   ```
3. Populate the config.

   Here are aws [endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html)
   Note: the `shaht` will be replaced with your pulumi [organizations](https://www.pulumi.com/docs/intro/console/accounts-and-organizations/organizations/) since we need to point to your stack reference.
   ```
   $ pulumi config set aws:region us-east-2 # must match vpc region
   $ pulumi config set config set mystackpath shaht/crosswalk-vpc/vpc-fargate
   ```
   
4. View the current config settings
   ```$ pulumi config```
   ```
   KEY                     VALUE
   aws:region           us-east-2
   mystackpath          shaht/crosswalk-vpc/vpc-fargate
   ```

5. Launch
 ```$ pulumi up```

6. Pulumi Console to view everything.  Note, you will have a url that shows up that will look similar to the url below.  The `shaht` will be replaced with your own org, for example if your org name is: `team-qa`:

   console view that matches above code as an example: 

   https://app.pulumi.com/`shaht`/fargate-with-crosswalk-vpc/ecs-fargate-dev/

   console view with YOUR ORG NAME:

   https://app.pulumi.com/`team-qa`/fargate-with-crosswalk-vpc/ecs-fargate-dev/

7.  View the outputs

```$ pulumi stack output```

```
   Current stack outputs (2):
    OUTPUT             VALUE
    ECS Cluster Tags   {"Name":"pulumi-fargate-ecs-cluster","application":"fargate","costcenter":"1234","crosswalk-vpc":"yes","demo":"yes","env":"dev","pulumi:Config":"Pulumi.ecs-fargate-dev.yaml","pulumi:project":"fargate-with-crosswalk-vpc","pulumi:stack":"ecs-fargate-dev","vpc_cidr":"10.0.0.0/24","vpc_name":"vpc-fargate-dev"}

    Load Balancer URL  pulumi-fargate-alb-7467631-1452059497.us-east-2.elb.amazonaws.com
   ```

7. Cleanup.  Destroy the vpc only if all there are no other resources running in it.)
   ```
   $ pulumi destroy
   $ pulumi rm ecs-fargate-dev
   ```