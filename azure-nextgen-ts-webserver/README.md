## Azure-Nextgen WebServer in TypeScript
1. Uses with [component resources](https://www.pulumi.com/docs/reference/pkg/python/pulumi/#pulumi.ComponentResource)
1. [Azure-nextgen api](https://www.pulumi.com/docs/reference/pkg/azure-nextgen/)
1. Sets up an azure-nextgen vnet with subnets
1. Launches vm's, creates security group rules, and launches an iot central app
1. Azure-nextgen policy pack

## Pre-Requisites

1. [Install Pulumi](https://www.pulumi.com/docs/reference/install).
1. Install [Node.js](https://nodejs.org/en/download).
1. Install a package manager for Node.js, such as [NPM](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/lang/en/docs/install).
1. [Configure Azure](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/).

## Getting-Started

1. create a new directory for your project

    `mkdir azure-nextgen-webserver-ts`
    `cd azure-nextgen-webserver-ts`
    
1. Clone the current git repo.

    `git clone`

1. Install the dependencies. Install a package manager for Node.js, such as [NPM](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/lang/en/docs/install).
    ```bash
    npm install
    ```
1. Create a new Pulumi stack named `dev`.

    ```bash
    pulumi stack init dev
    ```
1. Install the Azure NextGen Package

    Run the following command to install the Azure NextGen package:

    ```bash
    npm install @pulumi/azure-nextgen
    ```

1. Set the Pulumi configuration variables for the project:

   ```bash
   pulumi config set location eastus   # This is optional
   pulumi config set instanceCount 2  # This is optional
   pulumi config set nameprefix myproject # This is optional
   pulumi config set osprofile_password --secret REPLACEWITHYORUPASSWORD # This is optional
   ```
1. Deploy the stack with policy as code run locally.

    ```bash
    pulumi up --policy-pack policy-as-code/
    ```

## Clean Up

In each of the directories, run the following command to tear down the resources that are part of our
stack.

1. Run `pulumi destroy` to tear down all resources.  You'll be prompted to make
   sure you really want to delete these resources.

   ```bash
   pulumi destroy
   ```

1. To delete the stack, run the following command.

   ```bash
   pulumi stack rm
   ```
   > **Note:** This command deletes all deployment history from the Pulumi
   > Console and cannot be undone.
