# Pulumi:  A VPC on AWS built in Typescript.

### What Is This?

This example uses [Pulumi CrossWalk for AWS](https://www.pulumi.com/docs/guides/crosswalk/aws/#pulumi-crosswalk-for-aws) for deploying your own vpc using crosswalk [VPC](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  The VPC is built in `typescript`

### Why would you do this?  
An example showing that you can easily infrastructure written in a different language than the one you are used to.

### Where are the vpc settings? 
`Pulumi.aws-vpc-dev.yaml`

### How do I make changes to the cidr block, vpc name, zone number, aws region
Edit `Pulumi.aws-vpc-dev.yaml` configs via [pulumi config](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/) or directly.
We strongly recommend using pulumi config to avoid formatting errors.

1. Select the stack
```$ pulumi stack select aws-vpc-dev```

OR Create a empty stack with a given name(`myvpc`) and update all the fields below.
```$ pulumi stack init myvpc```

2. View the current config settings
   ```pulumi config```

   ```
   KEY                     VALUE
    aws:region              us-west-1
    number_of_nat_gateways  2
    vpc_cidr                10.0.0.0/24
    vpc_name                pulumi-crosswalk-vpc-dev
    zone_number             2
    ```
 
3. Update/Change configs
   Change aws region to Oregon:
    
    ```$ pulumi config set aws:region us-east-1 # any valid aws region```

   Change vpc cidr block:
    ```$ pulumi config set vpc_cidr: 10.0.0.0/23```  
   Change number of nat gateways 
    ```$ pulumi config set number_of_nat_gateways 3```

   Change name of vpc:
    ```$ pulumi config set vpc_name pulumi-myfargate-vpc-qa```

4. View the current config settings
   ```$ pulumi config``

   ```
   KEY                     VALUE
    aws:region              us-east-1
    number_of_nat_gateways  3
    vpc_cidr                10.0.0.0/23
    vpc_name                pulumi-myfargate-vpc-qa
    zone_number             3
   ```

5. Launch
 ```$ pulumi up```

6. Pulumi Console to view everything:   https://app.pulumi.com/REPLACE_WITH_YOUR_ORG/crosswalk-vpc/aws-vpc-dev/

7. View stack output:  ```$ pulumi config```

```
Current stack outputs (8):
    OUTPUT                              VALUE
    pulumi_vpc_aws_tags                 {"Name":"pulumi-myfargate-vpc-qa","availability_zones_used":"3","cidr_block":"10.0.0.0/23","cost_center":"1234","crosswalk":"yes","demo":"true","number_of_nat_gateways":"3","pulumi:Configs":"Pulumi.aws-vpc-dev.yaml","pulumi:Project":"crosswalk-vpc","pulumi:Stack":"aws-vpc-dev"}
    
    pulumi_vpc_az_zones                 3
    pulumi_vpc_cidr                     10.0.0.0/23
    pulumi_vpc_id                       vpc-002246b5eadbb8456
    
    pulumi_vpc_name                     pulumi-myfargate-vpc-qa
    
    pulumi_vpc_private_subnet_ids       ["subnet-0af33494835eb7255","subnet-0e8e1805d28628418","subnet-03ecc59be76ef13b3"]

    pulumi_vpc_public_subnet_ids        ["subnet-0daa62ac738be8e21","subnet-0b487562761324d18","subnet-0409215d463c6a90c"]

    pulumic_vpc_number_of_nat_gateways  3

More information at: https://app.pulumi.com/REPLACE_WITH_YOUR_ID/crosswalk-vpc/aws-vpc-dev 
```

7. Destroy VPC (only if there are no other resources running, do this)
   ```$ pulumi destroy```