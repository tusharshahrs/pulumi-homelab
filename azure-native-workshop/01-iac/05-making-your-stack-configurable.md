cd# Making Your Stack Configurable

Right now, the container's name is hard-coded. Next, you'll make the name configurable.

## Step 1 &mdash; Adding a Config Variable

Instead of hard-coding the `"files"` container, we will use configuration to make it easy to change the name without editing the program.

Add this line to `__main__.py` right after your import statements:

```python
config = pulumi.Config()
```

## Step 2 &mdash; Populating the Container Based on Config

Replace the hard-coded `"Name"` property value with the one from configuration:

```python
container = storage.BlobContainer('blobcontainer',
                resource_group_name= resource_group.name,
                account_name= account.name,
                container_name=config.require('container'))
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/05-making-your-stack-configurable/step2.py).

## Step 3 &mdash; Deploying the Changes

Now, deploy your changes. To do so, first configure your stack. If you don't, you'll get an error:

```bash
pulumi up
```

This results in an error like the following:

```
...
    error: Missing required configuration variable 'iac-workshop:container'
        please set a value using the command `pulumi config set iac-workshop:container <value>`
...
```

Configure the `iac-workshop:container` variable very much like the `azure:location` variable:

```bash
pulumi config set iac-workshop:container html
```

To make things interesting, I set the name to `html` which is different from the previously hard-coded value `files`.

Run `pulumi up` again. This detects that the container has changed and will perform a simple update:

```
View Live: https://app.pulumi.com/myuser/iac-workshop/dev/updates/17

     Type                                   Name              Status       Info
     pulumi:pulumi:Stack                    iac-workshop-dev               
 +-  └─ azure-native:storage:BlobContainer  blobcontainer     replaced     [diff: ~containerName]
 
Outputs:
  ~ blobcontainername : "files" => "html"
    myresourcegroup   : "my-resourcegroup76968b38"
    storageaccountname: "storageaccount88b0e076"

Resources:
    +-1 replaced
    3 unchanged

```

And you will see the contents added above.

## Step 4 &mdash; Inspect Your New Storage Account with the updated file name

Now run the `az` CLI to list the containers in this new account:

```
az storage container list --account-name $(pulumi stack output storageaccountname) -o table
Name    Lease Status    Last Modified
------  --------------  -------------------------
html    unlocked        2021-04-30T20:57:27+00:00
```

Notice that your `files` container has been replaced with `html`.


## Next Steps

* [Creating a Second Stack](./06-creating-a-second-stack.md)
