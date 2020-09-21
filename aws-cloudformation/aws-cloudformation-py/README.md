# Using Pulumi for launching a vpc via cloudformation stack in Python.  Then create subnets in pulumi after retreiving the vpc that was created via cloudformation

### What Is This?

Deploy a vpc(no subnets and no igw are created) in a aws region via pulumi in python. This is based on [From AWS CloudFormation](https://www.pulumi.com/docs/guides/adopting/from_aws/).  Then create public/private subnets with igw and route tables in pulumi.

### We will use StackReferences
The [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies) constructor takes as input a string of the form `org/project/stack`, and lets you access the outputs of that stack.  This format is ONLY for the SaaS based backend of pulumi(not for self-hosted).
### Which Backend are we using?

We are going to use [Pulumi Service backend](https://www.pulumi.com/docs/intro/concepts/state/#pulumi-service-backend) for saving states/checkpoints.

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use AWS](https://www.pulumi.com/docs/intro/cloud-providers/aws/setup/) (if your AWS CLI is configured, no further changes are required)

## Running the Example

Clone [the examples repo](https://github.com/pulumi/tusharshahrs/) and `cd` into it.

1. `cd aws-cloudformation-py` directory for usage information.
2. `cd aws-cloudformation-stack-to-pulumi-subnets-py` directory for usage information.