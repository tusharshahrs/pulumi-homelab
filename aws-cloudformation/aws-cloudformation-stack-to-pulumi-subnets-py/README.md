# Using Pulumi for launching a create subnets after vpc was previously created via cloudformation stack in Python.

## What Is This?

Create subnets, igw, route tables, and nat gateways building a well archtiected framework for the rest of the vpc.

## We will use StackReferences
The [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) constructor takes as input a string of the form `org/project/stack`, and lets you access the outputs of that stack.  This format is ONLY for the SaaS based backend of pulumi(not for self-hosted).

## Which Backend are we using?

We are going to use [Pulumi Service backend](https://www.pulumi.com/docs/intro/concepts/state/#pulumi-service-backend) for saving states/checkpoints.

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use AWS](https://www.pulumi.com/docs/intro/cloud-providers/aws/setup/) (if your AWS CLI is configured, no further changes are required)

## Running the Example

Clone [the examples repo](https://github.com/pulumi-homelab/tusharshahrs/) and `cd aws-cloudformation/aws-cloudformation-stack-to-pulumi-subnets-py`.

1. Initialize a new stack called: `dev` via [pulumi stack init](https://www.pulumi.com/docs/reference/cli/pulumi_stack_init/).
    ```
    $ pulumi stack init dev
    ```

2. Create a Python virtualenv, activate it, and install dependencies:

    This installs the dependent packages [needed](https://www.pulumi.com/docs/intro/concepts/how-pulumi-works/) for our Pulumi program.

    ```bash
    $ python3 -m venv venv
    $ venv/bin/python -m pip install --upgrade pip setuptools wheel
    $ venv/bin/python -m pip install -r requirements.txt
    ```
    
3.  View the current config settings. This will be empty.
    ```
    $ pulumi config
    ```
    ```
    KEY                     VALUE
    ```

4. Populate the config.

   Here are aws [endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html)

    ```bash
    $ pulumi config set aws:region us-east-2  # This needs to match vpc region
    $ pulumi config set mystackpath shaht/aws_cloudformation/dev  # This needs to YOUR stackreference path
    $ pulumi config set public_subnets[0] --path "10.0.0.0/24" # creating a list of public subnet cidr blocks
    $ pulumi config set public_subnets[1] --path "10.0.1.0/24" # creating a list of public subnet cidr blocks
    $ pulumi config set public_subnets[2] --path "10.0.2.0/25" # creating a list of public subnet cidr blocks
    $ pulumi config set private_subnets[0] --path "10.0.2.128/25" # creating a list of private subnet cidr blocks
    $ pulumi config set private_subnets[0] --path "10.0.3.0/25" # creating a list of private subnet cidr blocks
    $ pulumi config set private_subnets[0] --path "10.0.3.128/25" # creating a list of private subnet cidr blocks
    
    ```

5.  View the current config settings. This will be empty.
    ```
    $ pulumi config
    ```
    ```
    KEY              VALUE
    aws:region       us-east-2
    mystackpath      shaht/aws_cloudformation/dev
    private_subnets  ["10.0.2.128/25","10.0.3.0/25","10.0.3.128/25"]
    public_subnets   ["10.0.0.0/24","10.0.1.0/24","10.0.2.0/25"]
    ```
    
6. Launch
 ```$ pulumi up```

    Select `y` to continue

7. Pulumi Console to view everything.  Note, you will have a url that shows up that will look similar to the url below.  The `shaht` will be replaced with your own org, for example if your org name is: `team-qa`:

   console view that matches above code as an example: 

   https://app.pulumi.com/`shaht`/aws_subnet/dev

   console view with YOUR ORG NAME:

   https://app.pulumi.com/`team-qa`/aws_subnet/dev


8.  View the outputs

    ```$ pulumi stack output```

    ```
    Current stack outputs (6):
        OUTPUT                  VALUE
        my availability zones   ["us-east-2a","us-east-2b","us-east-2c"]
        my cloud formation arn  arn:aws:cloudformation:us-east-2:052848974346:stack/pulumi-vpc-cloudformation-df18e27/42843ed0-fc14-11ea-bd56-021a782363a8
        my private subnets      ["subnet-08f20f5aab15e7037","subnet-0c4c5a67f427ebb18","subnet-0f70327599b447b5c"]
        my public subnets       ["subnet-0e354fcdd1b87ea90","subnet-03e8798e40ef27e90","subnet-087ffd6cc4616683a"]
        my vpc cidr block       10.0.0.0/22
        my vpc id               vpc-0ac80e58472ac7dc4

9.  Cleanup
    ```
    pulumi destroy -y
    pulumi rm dev
    ```
