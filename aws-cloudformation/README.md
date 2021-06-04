# Using Pulumi for launching a vpc via cloudformation stack in Python

## What Is This?

Deploy a vpc(no subnets and no igw are created) in a aws region via pulumi in python. This is based on [From AWS CloudFormation](https://www.pulumi.com/docs/guides/adopting/from_aws/)

## We will use StackReferences
We do this via [StackReference](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies).
The vpc [outputs](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/) will be read as inputs in the ecs fargate.

## Which Backend are we using?

We are going to use [Pulumi Service backend](https://www.pulumi.com/docs/intro/concepts/state/#pulumi-service-backend) for saving states/checkpoints.

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to Use AWS](https://www.pulumi.com/docs/intro/cloud-providers/aws/setup/) (if your AWS CLI is configured, no further changes are required)

## Running the Example

Clone [the examples repo](https://github.com/pulumi-homelab/tusharshahrs/) and `cd` into it(steps below).

1. `cd aws-cloudformation-py` directory for usage information.
2. `cd aws-cloudformation-stack-to-pulumi-subnets-py` directory for usage information.