## Azure-Nextgen Serverless in TypeScript

This uploads an index.html file to an azure blob storage.  The index file is located in www folder.

## Pre-Requisites

1. [Install Pulumi](https://www.pulumi.com/docs/reference/install).
1. Install [Node.js](https://nodejs.org/en/download).
1. Install a package manager for Node.js, such as [NPM](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/lang/en/docs/install).
1. [Configure Azure](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/).

## Getting-Started

1. create a new directory for your project

    `mkdir azure-nextgen-serverless-ts`
    
    `cd azure-nextgen-serverless-ts`
    
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

1. Set the Pulumi configuration variables for the project:

   ```bash
   pulumi config set location eastus2   # This is optional
   pulumi config set name demo # This is optional

1. Deploy the stack with `pulumi up`.  Select `-y` when prompted.

    ```bash
    pulumi up
    ```
    ```
    Previewing update (dev)

    View Live: https://app.pulumi.com/shaht/azure-nextgen-serverless/dev/previews/22b812b0-866c-46d1-894a-0d0b04e9c67f

        Type                                             Name                          Plan       
    +   pulumi:pulumi:Stack                              azure-nextgen-serverless-dev  create     
    +   ├─ random:index:RandomString                     suffix                        create     
    +   ├─ azure-nextgen:resources/latest:ResourceGroup  resourceGroup                 create     
    +   ├─ azure-nextgen:storage/latest:StorageAccount   storageAccount                create     
    +   ├─ azure-nextgen:storage/latest:BlobContainer    blobContainer                 create     
    +   └─ azure:storage:Blob                            blobStorage                   create     
    
    Resources:
        + 6 to create

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    > yes
    no
    details
    ```
1.  Check the outputs via `pulumi stack output`

    ```
    Current stack outputs (5):
    OUTPUT                VALUE
        blobContainer_name    demo-blobcontainer-ajqc
        blobstorage_name      demo-blob-ajqc
        blobstorage_url       https://demostorageactajqc.blob.core.windows.net/demo-blobcontainer-ajqc/demo-blob-ajqc
        resourcegroup_name    demo-rg-ajqc
        storage_account_name  demostorageactajqc
    ```
1. Check the deployed index file in the blob storage
    ```bash
    curl $(pulumi stack output blobstorage_url)
    ```
## Clean-up

```
$ pulumi destroy -y
$ pulumi stack rm dev
```
###