# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir azure-function-workshop
cd azure-function-workshop
```

> Pulumi will use the directory name as your project name by default. To create an independent project, simply name the directory differently.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new azure-python
```

```
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name: (azure-function-workshop)
project description: (A minimal Azure Native Python Pulumi program)
Created project 'azure-function-workshop'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name: (dev)
Created stack 'dev'

azure-native:location: The Azure location to use: (WestUS) eastus
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'azure-function-workshop'

Please enter your desired stack name.
Created stack 'dev'

Saved config

Your new project is ready to go! ✨
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and written a requirements.txt file with the relevant python dependencies.

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your Pulimi program and stack definition file
* **`Pulumi.yaml`**: your project's metadata, containing its name and language
* **`Pulumi.dev.yaml`**: the Azure configuration for the Pulumi dev stack
* **`requirements.txt`**: the python dependencies required from PyPy

Open `__main__.py` to see the contents of the template program of your infrastructure stack:

```python
"""An Azure RM Python Pulumi program"""

import pulumi
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('resource_group')

# Create an Azure resource (Storage Account)
account = storage.StorageAccount('sa',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(
        name=storage.SkuName.STANDARD_LRS,
    ),
    kind=storage.Kind.STORAGE_V2)

# Export the primary key of the Storage Account
primary_key = pulumi.Output.all(resource_group.name, account.name) \
    .apply(lambda args: storage.list_storage_account_keys(
        resource_group_name=args[0],
        account_name=args[1]
    )).apply(lambda accountKeys: accountKeys.keys[0].value)

pulumi.export("primary_storage_key", primary_key)

```

Feel free to explore the other files, although we won't be editing any of them by hand.

# Next Steps

* [Configuring Azure](./02-configuring-azure.md)
