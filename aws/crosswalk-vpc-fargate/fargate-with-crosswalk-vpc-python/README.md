# Pulumi:  # Pulumi:  NGINX on AWS ECS Fargate using Python with a vpc built in Typescript

### What Is This?

ngxin on aws ecs fargate using `python` uses a vpc built via [crosswalk](https://www.pulumi.com/docs/guides/crosswalk/aws/vpc/).  
The VPC is built in `typescript`

### Why would you do this?  
An example showing that you can easily infrastructure written in a different language than the one you are used to.

### Where are the vpc settings? 
`Pulumi.aws-fargate-dev.yaml`

### How do I make changes to the cidr block, vpc name, zone number, aws region
Edit `Pulumi.aws-vpc-dev.yaml` configs via [pulumi config](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/) or directly.
We strongly recommend using pulumi config to avoid formatting errors.

1. Select the stack
```$ pulumi stack select aws-fargate-dev```

OR Create a empty stack with a given name(`qa`) and update all the fields below.
```$ pulumi stack init qa```

2. View the current config settings
   ```pulumi config```

   ```
   KEY                     VALUE
    aws:region              us-east-1
    ```
 
3. Update/Change configs if you need to match the vpc
   Change aws region to Oregon:
    
    ```$ pulumi config set aws:region us-west-2 # any valid aws region. PLEASE MATCH YOUR VPC region```

4. View the current config settings
   ```$ pulumi config```

   ```
   KEY                     VALUE
    aws:region              us-west-2
   ```

5. Launch
 ```$ pulumi up```

6. Pulumi Console to view everything:   https://app.pulumi.com/REPALCE_ME_WITH_YOUR_ORG/fargate-with-crosswalk-vpc/aws-fargate-dev/

7. View stack output:  ```$ pulumi stack output```

```
Current stack outputs (8):
    OUTPUT                              VALUE
    ECS Cluster Tags   {"Name":"pulumi-fargate-ecs-cluster","application":"fargate","costcenter":"1234","crosswalk-vpc":"yes","demo":"yes","env":"dev","pulumi:Config":"Pulumi.aws-fargate-dev.yaml","pulumi:project":"fargate-with-crosswalk-vpc","pulumi:stack":"aws-fargate-dev","vpc_cidr":"10.0.0.0/23","vpc_name":"pulumi-myfargate-vpc-qa"}

    Load Balancer URL  pulumi-fargate-alb-f5d26d7-804287123.us-east-1.elb.amazonaws.com
```

7. Destroy ecs cluster
   ```$ pulumi destroy```