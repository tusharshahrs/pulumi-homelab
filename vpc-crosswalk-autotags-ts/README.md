# Pulumi:  An AWS VPC built in Typescript while automatically applying Tags based on [Automatically Enforcing AWS Resource Tagging Policies](https://www.pulumi.com/blog/automatically-enforcing-aws-resource-tagging-policies/)

### What Is This?

This example uses [Pulumi CrossWalk for AWS](https://www.pulumi.com/docs/guides/crosswalk/aws/#pulumi-crosswalk-for-aws) for deploying your own vpc using crosswalk [VPC](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  The VPC is built in `typescript`.  The VPC automatically [applies tags](https://www.pulumi.com/blog/automatically-enforcing-aws-resource-tagging-policies/#automatically-applying-tags) based on global stack [transformation](https://www.pulumi.com/docs/intro/concepts/programming-model/#transformations) 

### Why would you do this?  
The VPC that automatically comes with built-in best practices.
The vpc is built using [component resources](https://www.pulumi.com/docs/intro/concepts/programming-model/#components).  

The [pulumi stack outputs](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/) will be used as [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) for other components.  This will allow you to use infrastructure written in typescript as an input for infrastructure written in python, go, and c#. 

### Where are the settings? 
 The settings are in `Pulumi`.stackname`.yaml`
 As a reference, we have included: `Pulumi.aws-vpc-dev.yaml`
 You will be creating a new file that holds your configs

### Creating a new `Pulumi`.stackname`.yaml`

 1. Initialize a new stack called: `vpc-tags` via [pulumi config](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/). 
      ```
      $ pulumi stack init vpc-tags
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
   $ pulumi config set vpc_name vpc-dev  # sets the vpc name in aws console
   $ pulumi config set vpc_cidr 10.0.0.0/22
   $ pulumi config set zone_number 3   # Sets number of az's
   $ pulumi config set number_of_nat_gateways 2 # anywhere from 1 to N (n = number of availability zones, which is zone number)
   $ pulumi config set costCenter 44332211  # This is a made up value, replace with whatever your costcenter is.
   ```
   
4. View the current config settings
   ```$ pulumi config```
   ```
   KEY                     VALUE
   aws:region              us-east-2
   costCenter              44332211
   number_of_nat_gateways  1
   vpc_cidr                10.0.0.0/22
   vpc_name                vpc-dev
   zone_number             3
   ```

5. Launch
 ```$ pulumi up```

6. Pulumi Console to view everything.  Note, you will have a url that shows up that will look similar to the url below.  The `shaht` will be replaced with your own org, `team-qa`:   
   https://app.pulumi.com/`shaht`/crosswalk-vpc/vpc-tags/

7. The stack outputs will be used as [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) for ECS fargate (resides in ecs-fargate-python folder)

   ```$ pulumi stack output```

   ```
   Current stack outputs (7):
      OUTPUT                              VALUE
      pulumi_vpc_az_zones                 3
      pulumi_vpc_cidr                     10.0.0.0/22
      pulumi_vpc_id                       vpc-0480377fd785befec
      pulumi_vpc_name                     vpc-dev
      pulumi_vpc_private_subnet_ids       ["subnet-0df1acfab110b387d","subnet-0081a3e6a19551785","subnet-067d448c00b416ab2"]
      pulumi_vpc_public_subnet_ids        ["subnet-0f2cad860737e7be1","subnet-0dd9846d6b1fec453","subnet-01f7b4bbb921d3040"]
      pulumic_vpc_number_of_nat_gateways  1
      ```

7. Cleanup.  Destroy the vpc only if all there are no other resources running in it.)
   ```
   $ pulumi destroy      # terminating the resources
   $ pulumi rm vpc-tags  # removing the stack completely from app.pulumi console
   ```

## Reference

- autotags.ts 
   - registerAutoTags registers a global stack transformation that merges a set
 of tags with whatever was also explicitly added to the resource definition.
- taggagble.ts
   - isTaggable returns true if the given resource type is an AWS resource that supports tags. List of known aws type tokens that are taggable
 