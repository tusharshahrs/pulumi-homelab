# Deploying a Serverless Jenkins Application on Azure Functions

You will deploy a Azure Function Apps with that loads a jekins docker image

## Prerequisites

- [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
- [Configure Azure credentials](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/)

## Instructions

### Step 1: Create a new stack

```
$ cd azure-jenkins-ts 
$ pulumi stack init dev
```

### Step 2: Log in to the Azure CLI

You will be prompted to do this during deployment if you forget this step.

```
$ az login
```

### Step 3: Install NPM dependencies

```
$ npm install
```

### Step 4: Set your azure location. Note, we selected eastus2. You can pick any valid azure region you want.

```$ pulumi config set azure-native:location``` **eastus2**


### Step 5: Deploy your changes

Run `pulumi up` to preview and deploy changes:

```
$ pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/myuser/azure-jenkins-ts/dev/previews/ce65f261-d416-48e4-b456-e6e8fa6c2ba9

     Type                                     Name                  Plan       
 +   pulumi:pulumi:Stack                      azure-jenkins-ts-dev  create     
 +   ├─ azure-native:resources:ResourceGroup  jenkins-tutorial-rg   create     
 +   ├─ azure-native:web:AppServicePlan       plan                  create     
 +   └─ azure-native:web:WebApp               jekinsApp             create     
 
Resources:
    + 4 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
>  yes
 no
  details

  View Live: https://app.pulumi.com/myuser/azure-jenkins-ts/dev/updates/3

     Type                                     Name                  Status      
 +   pulumi:pulumi:Stack                      azure-jenkins-ts-dev  created     
 +   ├─ azure-native:resources:ResourceGroup  jenkins-tutorial-rg   created     
 +   ├─ azure-native:web:AppServicePlan       plan                  created     
 +   └─ azure-native:web:WebApp               jekinsApp             created     
 
Outputs:
    jenkinsEndpoint: "https://jekinsapp7426b3ac.azurewebsites.net"

Resources:
    + 4 created

Duration: 33s
```

### Step 6: Check the deployed jenkins endpoint

```
$ pulumi stack output jenkinsEndpoint
https://jekinsapp7426b3ac.azurewebsites.net
```

### Step 7: Load the URL in a browser.  
- Wait about 60 seconds for jekins to warm up the 1st time
- Wait about another 60-90 seconds for the jenkins app to create the login page
   
   ```Unlock Jenkins To ensure Jenkins is securely set up by the administrator, a password has been written to the log (not sure where to find it?) and this file on the server:```

### Step 8: Cleanup and Destroy
```
$ pulumi destroy -y

View Live: https://app.pulumi.com/myuser/azure-jenkins-ts/dev/updates/4

     Type                                     Name                  Status      
 -   pulumi:pulumi:Stack                      azure-jenkins-ts-dev  deleted     
 -   ├─ azure-native:web:WebApp               jekinsApp             deleted     
 -   ├─ azure-native:web:AppServicePlan       plan                  deleted     
 -   └─ azure-native:resources:ResourceGroup  jenkins-tutorial-rg   deleted     
 
Outputs:
  - jenkinsEndpoint: "https://jekinsapp7426b3ac.azurewebsites.net"

Resources:
    - 4 deleted

The resources in the stack have been deleted, but the history and configuration associated with the stack are still maintained. 
If you want to remove the stack completely, run 'pulumi stack rm dev'.
Duration: 57s
```
Remove the stack
```
pulumi stack rm dev -y`
```