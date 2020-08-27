# Pulumi:  A VPC on AWS built in Typescript.

### What Is This?

This example uses [Pulumi CrossWalk for AWS](https://www.pulumi.com/docs/guides/crosswalk/aws/#pulumi-crosswalk-for-aws) for deploying your own vpc using crosswalk[VPC](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  The VPC is built in `typescript`

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

   ```KEY                     VALUE
    aws:region              us-west-2
    number_of_nat_gateways  2
    vpc_cidr                10.0.0.0/23
    vpc_name                pulumi-crosswalk-vpc-dev
    zone_number             3```
 
3. Update/Change configs
   Change aws region to Oregon: 
    ```$ pulumi config set aws:region us-west-2 # any valid AWS region will work```
   Change vpc cidr block:
    ```$ pulumi config set vpc_cidr: 10.0.0.0/24```  
   Change number_of_nat_gateways 
    ```$ pulumi config set number_of_nat_gateways 3```
   Change name of vpc:
    ```$ pulumi config set vpc_name pulumi-brandnewname-vpc-qa```

4. Launch
 ```$ pulumi up```

5. Pulumi Console to view everything:   https://app.pulumi.com/REPLACE_WITH_YOUR_ORG/crosswalk-vpc/aws-vpc-dev/
6. View stack output:  ```$ pulumi config```

```Current stack outputs (7):
    OUTPUT                              VALUE
    pulumi_vpc_aws_tags                 {"Name":"pulumi-crosswalk-vpc-dev","availability_zones_used":"3","cidr_block":"10.0.0.0/23","cost_center":"1234","crosswalk":"yes","demo":"true","number_of_nat_gateways":"2","pulumi:Configs":"Pulumi.aws-vpc-dev.yaml","pulumi:Project":"crosswalk-vpc","pulumi:Stack":"aws-vpc-dev"}
    pulumi_vpc_az_zones                 3
    pulumi_vpc_id                       vpc-0f64e7a91c1ef052d
    pulumi_vpc_name                     pulumi-crosswalk-vpc-dev
    pulumi_vpc_private_subnet_ids       ["subnet-06e5c08692100cbd9","subnet-0e7d9fc44aa7c3c6d","subnet-0f2986952f62402d9"]
    pulumi_vpc_public_subnet_ids        ["subnet-0427597989e2e6e17","subnet-04ed6cfb905a35c4f","subnet-0bbad6df50282b8b5"]
    pulumic_vpc_number_of_nat_gateways  2```

7. Destroy VPC (only if there are no other resources running, do this)
   ```$ pulumi destroy```