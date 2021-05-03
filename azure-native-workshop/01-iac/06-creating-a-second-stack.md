# Creating a Second Stack

It is easy to create multiple instances of the same project. This is called a stack. This is handy for multiple development or test environments, staging versus production, and scaling a given infrastructure across many regions.

## Step 1 &mdash; Create and Configure a New Stack

Create a new stack:

```bash
pulumi stack init prod
```

`Created stack 'prod'`

Next, configure its two required variables:

```bash
pulumi config set azure-native:location eastus
pulumi config set iac-workshop:container htmlprod
```

If you are ever curious to see the list of stacks for your current project, run this command:

```bash
pulumi stack ls
```

It will print all stacks for this project that are available to you:

```
NAME   LAST UPDATE     RESOURCE COUNT  URL
dev    17 minutes ago  5               https://app.pulumi.com/shaht/iac-workshop/dev
prod*  n/a             n/a             https://app.pulumi.com/shaht/iac-workshop/prod
```

## Step 2 &mdash; Deploy the New Stack

Now deploy all of the changes:

```bash
pulumi up
```

This will create an entirely new set of resources from scratch for `prod`, unrelated to the existing `dev` stack's resources.

```
Updating (prod)

View Live: https://app.pulumi.com/myuser/iac-workshop/prod/updates/1

     Type                                     Name               Status      
 +   pulumi:pulumi:Stack                      iac-workshop-prod  created     
 +   ├─ azure-native:resources:ResourceGroup  my-resourcegroup   created     
 +   ├─ azure-native:storage:StorageAccount   storageaccount     created     
 +   └─ azure-native:storage:BlobContainer    blobcontainer      created     
 
Outputs:
    blobcontainername : "htmlprod"
    myresourcegroup   : "my-resourcegroupd1731799"
    storageaccountname: "storageaccount59f85cdd"

Resources:
    + 4 created
```

A new set of resources has been created for the `prod` stack.

## Step 3 &mdash; Inspect Your New Storage Account in the new environment

Now run the `az` CLI to list the containers in this new stack:

```
az storage container list --account-name $(pulumi stack output storageaccountname) -o table
Name      Lease Status    Last Modified
--------  --------------  -------------------------
htmlprod  unlocked        2021-04-28T18:52:57+00:00
```

Notice that your container now has `htmlprod`.

```bash
pulumi stack ls
```

```
NAME   LAST UPDATE     RESOURCE COUNT  URL
dev    23 minutes ago  5               https://app.pulumi.com/shaht/iac-workshop/dev
prod*  1 minute ago    5               https://app.pulumi.com/shaht/iac-workshop/prod
```

## Next Steps

* [Destroying Your Infrastructure](./07-destroying-your-infrastructure.md)
