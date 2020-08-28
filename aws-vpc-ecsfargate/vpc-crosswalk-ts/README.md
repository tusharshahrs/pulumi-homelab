# Pulumi:  A VPC on AWS built in Typescript.

### What Is This?

This example uses [Pulumi CrossWalk for AWS](https://www.pulumi.com/docs/guides/crosswalk/aws/#pulumi-crosswalk-for-aws) for deploying your own vpc using crosswalk [VPC](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  The VPC is built in `typescript`

### Why would you do this?  
An example showing that you can easily infrastructure written in a different language than the one you are used to.

### Where are the settings? 
 The settings are in `Pulumi`.stackname`.yaml`
 As a reference, we have included: `Pulumi.aws-vpc-dev.yaml`
 You will be creating a new file that holds your configs

### Creating a new `Pulumi`.stackname`.yaml`

 1. Initialize a new stack called: `vpc-fargate` via [pulumi config](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/). 
      ```
      $ pulumi stack init vpc-fargate
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
   ```
   $ pulumi config set aws:region us-east-2 # any valid aws region endpoint
   $ pulumi config set vpc_name pulumi vpc-fargate-dev
   $ pulumi config set vpc_cidr 10.0.0.0/24
   $ pulumi config set number_of_nat_gateways 2 # anywhere from 1 - N (n = number of availability zones)
   ```
   
4. View the current config settings
   ```$ pulumi config```
   ```
   KEY                     VALUE
   aws:region              us-east-2
   number_of_nat_gateways  2
   vpc_cidr                10.0.0.0/24
   vpc_name                vpc-fargate-de
   ```

5. Launch
 ```$ pulumi up```

6. Pulumi Console to view everything.  Note, you will have a url that shows up that will look similar to the url below.  The `shaht` will be replaced with your own org, `team-qa`:   
   https://app.pulumi.com/`shaht`/crosswalk-vpc/vpc-fargate/

7. The stack outputs will be used as [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) for ECS fargate (resides in ecs-fargate-python folder)

```$ pulumi stack output```

```
   Current stack outputs (7):
      OUTPUT                              VALUE
      pulumi_vpc_aws_tags                 {"Name":"vpc-fargate-dev","availability_zones_used":"undefined","cidr_block":"10.0.0.0/24","cost_center":"1234","crosswalk":"yes","demo":"true","number_of_nat_gateways":"2","pulumi:Configs":"Pulumi.vpc-fargate.yaml","pulumi:Project":"crosswalk-vpc","pulumi:Stack":"vpc-fargate"}

      pulumi_vpc_cidr                     10.0.0.0/24
      pulumi_vpc_id                       vpc-0a502f0315d60c6fb
      pulumi_vpc_name                     vpc-fargate-dev
      pulumi_vpc_private_subnet_ids       ["subnet-06641523ee36eb581","subnet-0be01aa5512c72ec0"]
      pulumi_vpc_public_subnet_ids        ["subnet-03e3dd42505cb00d4","subnet-04eee597e6b5d0d49"]
      pulumic_vpc_number_of_nat_gateways  2
   ```

7. Cleanup.  Destroy the vpc only if all there are no other resources running in it.)
   ```
   $ pulumi destroy
   $ pulumi rm vpc-fargate
   ```
