# Azure Native Workshop with Pulumi

This hands-on workshop will walk you through various tasks of managing Azure infrastructure with the focus on setting up python and managed Azure services. All the resources are provisioned with [Pulumi](https://www.pulumi.com/) in the infrastructure-as-code fashion.

## Prerequisities

Before Proceeding, ensure your machine is ready to go:
* [Installing Prerequisites](./00-installing-prerequisites.md)

### Lab 1 — Modern Infrastructure as Code

The first lab takes you on a tour of infrastructure as code concepts:

1. [Creating a New Project](./01-iac/01-creating-a-new-project.md)
2. [Configuring Azure](./01-iac/02-configuring-azure.md)
3. [Provisioning Infrastructure](./01-iac/03-provisioning-infrastructure.md)
4. [Updating your Infrastructure](./01-iac/04-updating-your-infrastructure.md)
5. [Making Your Stack Configurable](./01-iac/05-making-your-stack-configurable.md)
6. [Creating a Second Stack](./01-iac/06-creating-a-second-stack.md)
7. [Destroying Your Infrastructure](./01-iac/07-destroying-your-infrastructure.md)

### Lab 2 - Deploy Serverless Applications with Azure Functions

In this lab, you deploy an Azure Function App with HTTP-triggered serverless functions.

1. [Creating a New Project](./02-serverless/01-creating-a-new-project.md)
2. [Configuring Azure](./02-serverless/02-configuring-azure.md)
3. [Creating a Resource Group](./02-serverless/03-provisioning-infrastructure.md)
4. [Creating a Storage Account](./02-serverless/03-provisioning-infrastructure.md#step-2--add-a-storage-account)
5. [Creating a Consumption Plan](./02-serverless/03-provisioning-infrastructure.md#step-3--define-a-consumption-plan)
6. [Retrieve Storage Account Keys and Build Connection String](./02-serverless/03-provisioning-infrastructure.md#step-4--retrieve-storage-account-keys-and-build-connection-string)
7. [Creating a Function App](./02-serverless/03-provisioning-infrastructure.md#step-5--create-a-function-app)
8. [Export the Function App endpoint](./02-serverless/03-provisioning-infrastructure.md#step-6--export-the-function-app-endpoint)
9. [Provision the Function App](./02-serverless/03-provisioning-infrastructure.md#step-7--provision-the-function-app)
10. [Destroy Everything](./02-serverless/03-provisioning-infrastructure.md#step-8--destroy-everything)