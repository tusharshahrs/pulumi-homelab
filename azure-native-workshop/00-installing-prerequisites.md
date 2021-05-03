# Installing Prerequisites

The hands-on workshop will walk you through various tasks of managing Azure infrastructure with the focus on serverless compute and managed Azure services. The prerequisites listed below are required to successfully complete them.

## Install Visual Studio Code
   Install [visual studio code](https://code.visualstudio.com/download)

## Python Install
Install [Python version 3.6 or later](https://www.python.org/downloads/). To reduce potential issues with setting up your Python environment on Windows or macOS, you should install Python through the official Python installer.
   
   * **Note**: `pip` is required to install dependencies. If you installed Python from source, with an installer from [python.org](https://www.python.org/), or 
     via [Homebrew](https://brew.sh/) you should already have `pip`. 
     If Python is installed using your OS package manager, you may have to install `pip` separately, see 
     [Installing pip/setuptools/wheel with Linux Package Managers](https://packaging.python.org/guides/installing-using-linux-tools/). 
     For example, on Debian/Ubuntu you must run `sudo apt install python3-venv python3-pip`
   
   * **Note**: If you're having trouble setting up Python on your machine, 
     see [Python 3 Installation & Setup Guide](https://realpython.com/installing-python/) for detailed installation instructions on various operating systems and distributions.

After installing, [verify](https://phoenixnap.com/kb/check-python-version) that python3 is working.
   * Linux
      ```
     $python ––version
     3.6.13
     ```
   * Windows
     ```
     - $ `python ––version`
     3.6.13
     ```
   * macOS
     ```
     $python3 --version
     Python 3.6.13
     ```

## Azure Subscription and CLI

You need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or create a free Azure subscription [here](https://azure.microsoft.com/free/).

Please be sure to have administrative access to the subscription.

Be sure to clean up the resources after you complete the workshop, as described at the last step of each lab.

You will also use the command-line interface (CLI) tool to log in to an Azure subscription. You can install the Azure CLI tool, as described [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

After you complete the installation, open a command prompt and type `az`. You should see the welcome message:

```
$ az
     /\
    /  \    _____   _ _  ___ _
   / /\ \  |_  / | | | \'__/ _\
  / ____ \  / /| |_| | | |  __/
 /_/    \_\/___|\__,_|_|  \___|


Welcome to the cool new Azure CLI!
```

## Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v3.1.0
```

Setup your AccessToken
 - Navigate to **Profile Settings** by selecting your avatar, then **Settings**. The Profile tab is displayed by default.
   ![Profile Image](https://www.pulumi.com/images/docs/reference/service/user-profile-page.png)
 - Click on [Access Tokens](https://www.pulumi.com/docs/intro/console/accounts/#access-tokens) on the left side. Create a new *AccessToken*. Copy the AccessToken to your clipboard to use in the next step.
 - On your cli: pulumi login
   * Enter your *AccessToken* from the previous step.