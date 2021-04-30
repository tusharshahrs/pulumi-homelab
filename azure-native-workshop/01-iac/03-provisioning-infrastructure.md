# Provisioning Infrastructure

Now that you have a project configured to use Azure, you'll create some basic infrastructure in it. We will start with a Resource Group.

## Step 1 &mdash; Declare a New Resource Group and export it

Edit your `__main__.py` file, and leave only a new resource definition and required dependencies. Change the name of the resource group to 'my-resourcegroup'. Programs can export variables which will be shown in the CLI and recorded for each deployment.  We will add a pulumi.export code.

```python
import pulumi
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('my-resourcegroup')

# Export the Azure Resource Group
pulumi.export('myresourcegroup', resource_group.name)
```

Programs can export variables which will be shown in the CLI and recorded for each deployment.


> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step1.py).

## Step 2 &mdash; Preview Your Changes

Now preview your changes:

```
pulumi up
```

This command evaluates your program, determines the resource updates to make, and shows you an outline of these changes:

```
View Live: https://app.pulumi.com/myuser/iac-workshop/dev/previews/94d6a158-9baa-4c4c-b649-5633ba34a2a4

Previewing update (dev):

     Type                                     Name              Plan       
 +   pulumi:pulumi:Stack                      iac-workshop-dev  create     
 +   └─ azure-native:resources:ResourceGroup  my-resourcegroup  create   
 
Resources:
    + 2 to create

Do you want to perform this update?
  yes
  no
> details
```

This is a summary view. Select `details` to view the full set of properties:

```
View Live: https://app.pulumi.com/myuser/iac-workshop/dev/previews/948c62fe-b333-4e79-b4d8-587e78379217

     Type                                     Name              Plan       
 +   pulumi:pulumi:Stack                      iac-workshop-dev  create     
 +   └─ azure-native:resources:ResourceGroup  my-resourcegroup  create     
 
Resources:
    + 2 to create

Do you want to perform this update? details
+ pulumi:pulumi:Stack: (create)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    + azure-native:resources:ResourceGroup: (create)
        [urn=urn:pulumi:dev::iac-workshop::azure-native:resources:ResourceGroup::my-resourcegroup]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:azure-native::default_1_2_0::04da6b54-80e4-46f7-96ec-b56ff0331ba9]
        location            : "eastus2"
        resourceGroupName   : "my-resourcegroupa908b9ee"
```

The stack resource is a synthetic resource that all resources your program creates are parented to.

## Step 3 &mdash; Deploy Your Changes

Now that we've seen the full set of changes, let's deploy them. Select `yes`:

```
View Live: https://app.pulumi.com/shaht/iac-workshop/dev/updates/1

     Type                                     Name              Status      
 +   pulumi:pulumi:Stack                      iac-workshop-dev  created     
 +   └─ azure-native:resources:ResourceGroup  my-resourcegroup  created     
 
Outputs:
    myresourcegroup: "my-resourcegroup32b80185"

Resources:
    + 2 created

Duration: 8s

```

Now your resource group has been created in your Azure account. Feel free to click the View Live link and explore; this will take you to the [Pulumi Console](https://www.pulumi.com/docs/intro/console/), which records your deployment history.

## Step 4 &mdash; View your Stack Outputs

We created a resource group and to see what it is we can show a stack's output properties via [pulumi stack output](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/)

```bash
pulumi stack output
```

will display

```
Current stack outputs (1):
    OUTPUT           VALUE
    myresourcegroup  my-resourcegroup32b80185
```

Note that Pulumi appends a suffix to the physical name of the resource group, e.g. `my-resourcegroup32b80185`. The difference between logical and physical names is due to "auto-naming" which Pulumi does to ensure side-by-side projects and zero-downtime upgrades work seamlessly. It can be disabled if you wish; [read more about auto-naming here](https://www.pulumi.com/docs/intro/concepts/programming-model/#autonaming).

## Next Steps

* [Updating Your Infrastructure](./04-updating-your-infrastructure.md)
