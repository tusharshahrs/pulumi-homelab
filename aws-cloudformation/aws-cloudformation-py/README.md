# Using Pulumi for launching a vpc via cloudformation stack in Python.

### What Is This?

Deploy a vpc(no subnets and no igw are created) in a aws region via pulumi in python. This is based on [From AWS CloudFormation](https://www.pulumi.com/docs/guides/adopting/from_aws/).  Create outputs that will be used in next part.

### We will use StackReferences
The [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) constructor takes as input a string of the form `org/project/stack`, and lets you access the outputs of that stack.  This format is ONLY for the SaaS based backend of pulumi(not for self-hosted).
### Which Backend are we using?

We are going to use [Pulumi Service backend](https://www.pulumi.com/docs/intro/concepts/state/#pulumi-service-backend) for saving states/checkpoints.

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use AWS](https://www.pulumi.com/docs/intro/cloud-providers/aws/setup/) (if your AWS CLI is configured, no further changes are required)

## Running the Example

Clone [the examples repo](https://github.com/pulumi/tusharshahrs/) and `cd` into it.

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
    $ pulumi config set aws:region us-east-2
    $ pulumi config set myvpccidrblock 10.0.0.0/22
    ```

5. Launch
 ```$ pulumi up```

    Select `y` to continue

6. Pulumi Console to view everything.  Note, you will have a url that shows up that will look similar to the url below.  The `shaht` will be replaced with your own org, for example if your org name is: `team-qa`:

   console view that matches above code as an example: 

   https://app.pulumi.com/`shaht`/aws_cloudformation/dev

   console view with YOUR ORG NAME:

   https://app.pulumi.com/`team-qa`/aws_cloudformation/dev

    COPY the StackReference path. We will need this in the next part of the exercise
    
      `shaht`/aws_cloudformation/dev

7.  View the outputs

    ```$ pulumi stack output```

    ```
    Current stack outputs (3):
        OUTPUT                          VALUE
        pulumi-cloudformation-arn       arn:aws:cloudformation:us-east-2:052848974346:stack/pulumi-vpc-cloudformation-df18e27/42843ed0-fc14-11ea-bd56-021a782363a8
        pulumi-cloudformation-vpc-cidr  10.0.0.0/22
        pulumi-cloudformation-vpc-id    vpc-0ac80e58472ac7dc4

8.  Continue to the subnets, igw, and route table section:
    
    ```
    cd aws-cloudformation-stack-to-pulumi-subnets-py 
    ```

9.  Cleanup
    ```
    pulumi destroy -y
    pulumi rm dev
    ```
