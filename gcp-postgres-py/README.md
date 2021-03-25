[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

#  Postgressql with tables on GCP Cloud SQL in Python

### What Is This?
 
  This example creates uses gcp.  We are creating a google cloud sql instance, then using the postgres provider to create the database.  Then we are using the pg8000 to create tables and delete tables. This is done in Python 

## Prerequisites

* [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [Configure Pulumi to access your Google Cloud Account](https://www.pulumi.com/docs/get-started/gcp/begin/#configure-pulumi-to-access-your-google-cloud-account) 

## Running the Example
1.  Initialize a new stack called: `dev` via [pulumi stack init](https://www.pulumi.com/docs/reference/cli/pulumi_stack_init/). 
      ```
      $ pulumi stack init dev
      ```
1.  Create a Python virtualenv, activate it, and install dependencies:

    This installs the dependent packages [needed](https://www.pulumi.com/docs/intro/concepts/how-pulumi-works/) for our Pulumi program.

    ```bash
    $ python3 -m venv venv
    $ source venv/bin/activate
    $ pip3 install -r requirements.txt
    ```

1. Populate the config via [pulumi config set](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/).
    
   Here are the gcp [regions](https://cloud.google.com/about/locations)
  
   ```
   $ pulumi config set gcp:project mycurrent-project1  # replace mycurrent-project1
   $ pulumi config set gcp:region us-central1 # Pick any region you want
   $ pulumi config set myip 123.345.67.890/32 --secret # This is your ip, in case you want to connect to the sql server via gui
   ```
   
1. Run `pulumi up` to preview and deploy changes: You must select `y` to continue

1. Table creation & Deletion configuration setup. We are using [pg8000](https://github.com/tlocke/pg8000) to create and delete tables. To avoid hard coding values in your file, you can pass them in as [secret](https://www.pulumi.com/docs/intro/concepts/secrets/#secrets) [configs](https://www.pulumi.com/docs/intro/concepts/config/#setting-and-getting-configuration-values)
1. Run `pulumi up` to preview and deploy changes: You must select `y` to continue
1. The following items need to be SET AFTER the 1st time `pulumi up` is run and the gcp sql instance has been created.  We need this information for to create the tables
   ```
   $ pulumi config set postgres_database pulumi-votes-database-2a08d2a
   $ pulumi config set postgres_sql_instance_public_ip_address 146.148.69.246 --secret
   $ pulumi config set postgres_user pulumiadmin --secret
   $ pulumi config set postgres_user_pwd AbcdefghijklopU --secret
   ```

## Informational: reference to packages.
  - [pulumi](https://github.com/pulumi/pulumi)
  - [gcp](https://www.pulumi.com/docs/reference/pkg/gcp/)
  - [postgressql](https://www.pulumi.com/docs/reference/pkg/postgresql/)
    - [repo postgres-sql](https://github.com/pulumi/pulumi-postgresql)
  - [random](https://www.pulumi.com/docs/reference/pkg/random/)
    - [repo random](https://github.com/pulumi/pulumi-random)
  - [pg8000](https://pypi.org/project/pg8000/)