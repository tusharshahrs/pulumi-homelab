[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

# Google Network VPC, Cloud SQL PostGres, and Google Cloud Functions in Python via component resources

This example deploys a google vpc network and subnet, a cloud sql in postgres, and google cloud function.

## Deploying and running the program

1. Create a new stack: 
    ```bash
    $ pulumi stack init dev
    ```
1. Set the variables via [pulumi config set](https://www.pulumi.com/docs/reference/cli/pulumi_config_set/)

1. Set the GCP project:
    ```bash
    $ pulumi config set gcp:project gcp-project-selected
    ```
1. Set the GCP region:
    ```bash
    $ pulumi config set gcp:region us-central1
    ```

1. Set the GCP network vpc with 3 subnets.
    ```bash
    $ pulumi config set subnet_cidr_blocks2 '["10.0.0.0/25","10.0.0.128/26","10.0.0.192/26"]'
    ```

1. Create a Python virtualenv, activate it, and install dependencies:

    This installs the dependent packages [needed](https://www.pulumi.com/docs/intro/concepts/how-pulumi-works/) for our Pulumi program.

    ```bash
    $ python3 -m venv venv
    $ source venv/bin/activate
    $ pip3 install -r requirements.txt
    ```

1. Run `pulumi up` to preview and deploy changes.  After the preview is shown you will be
    prompted if you want to continue or not.

    ```bash
    $ pulumi up
    Previewing update (dev)

    View Live: https://app.pulumi.com/shaht/gcp-ref-py/dev/previews/4f9e586b-3a97-44de-874d-7e4b37293808

        Type                              Name                                 Plan       
    +   pulumi:pulumi:Stack               gcp-ref-py-dev                       create...  
    +   ├─ custom:resource:Postgres       gcp-ref-py-demo-database             create     
    +   │  └─ gcp:sql:DatabaseInstance     gcp-ref-py-demo-database-dbinstance    create     
    +   │     ├─ gcp:sql:Database          gcp-ref-py-demo-database-pulumidb      create     
    +   │     └─ gcp:sql:User              gcp-ref-py-demo-database-user          create     
    +   ├─ component:network:VPC           gcp-ref-py-demo-vpc                     create     
    +   │  └─ gcp:compute:Network                      gcp-ref-py-demo-vpc                         create     
    +   pulumi:pulumi:Stack                            gcp-ref-py-dev                              create     
    +   │     ├─ gcp:compute:Subnetwork                gcp-ref-py-demo-vpc-subnet-1                create     
    +   │     ├─ gcp:compute:Subnetwork                gcp-ref-py-demo-vpc-subnet-2                create     
    +   │     ├─ gcp:compute:Router                    gcp-ref-py-demo-vpc                         create     
    +   │     └─ gcp:compute:RouterNat                 gcp-ref-py-demo-vpc                         create     
    +   ├─ custom:resource:CloudFunction               gcp-ref-py-demo-function                    create     
    +   │  ├─ gcp:storage:Bucket                       gcp-ref-py-demo-function-bucket             create     
    +   │  │  └─ gcp:storage:BucketObject              gcp-ref-py-demo-function-bucketobject       create     
    +   │  └─ gcp:cloudfunctions:Function              gcp-ref-py-demo-function-cloudfunction      create     
    +   │     └─ gcp:cloudfunctions:FunctionIamMember  gcp-ref-py-demo-function-functioniammember  create     
    +   ├─ gcp:storage:Bucket                          gcp-ref-py-demo-bucket                      create     
    +   └─ random:index:RandomPassword                 gcp-ref-py-demo-database-random             create     
    
    Resources:
        + 19 to create

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    > yes
    no
    details

    View Live: https://app.pulumi.com/shaht/gcp-ref-py/dev/updates/51

        Type                               Name                                    Status       
    +   pulumi:pulumi:Stack                gcp-ref-py-dev                          creating..   
    +   ├─ component:network:VPC           gcp-ref-py-demo-vpc                     creating..   
    +   │  └─ gcp:compute:Network          gcp-ref-py-demo-vpc                     created      
    +   │     ├─ gcp:compute:Subnetwork    gcp-ref-py-demo-vpc-subnet-0            creating..   
    +   │     ├─ gcp:compute:Subnetwork                gcp-ref-py-demo-vpc-subnet-1                creating...  
    +   ├─ component:network:VPC                       gcp-ref-py-demo-vpc                         creating..   
    +   │     ├─ gcp:compute:Router                    gcp-ref-py-demo-vpc                         created      
    +   │     └─ gcp:compute:RouterNat                 gcp-ref-py-demo-vpc                         created      
    +   ├─ custom:resource:CloudFunction               gcp-ref-py-demo-function                    creating..   
    +   │  ├─ gcp:storage:Bucket                       gcp-ref-py-demo-function-bucket             created      
    +   │  │  └─ gcp:storage:BucketObject              gcp-ref-py-demo-function-bucketobject       created      
    +   │  └─ gcp:cloudfunctions:Function              gcp-ref-py-demo-function-cloudfunction      created      
    +   │     └─ gcp:cloudfunctions:FunctionIamMember  gcp-ref-py-demo-function-functioniammember  created      
    +   ├─ custom:resource:Postgres                    gcp-ref-py-demo-database                    creating..   
    +   │  └─ gcp:sql:DatabaseInstance                 gcp-ref-py-demo-database-dbinstance         creating     
    +   ├─ gcp:storage:Bucket                          gcp-ref-py-demo-bucket                      created      
    +   └─ random:index:RandomPassword                 gcp-ref-py-demo-database-random             created      

    Outputs:
    bucket_name                : "gs://gcp-ref-py-demo-bucket-c2bea5c"
    database_instance          : "gcp-ref-py-demo-database-dbinstance-a3461f1"
    database_name              : "gcp-ref-py-demo-database-pulumidb-0cb3b5f"
    database_user              : "pulumiadmin"
    database_user_password     : "[secret]"
    function_bucket_name       : "gcp-ref-py-demo-function-bucket-cc33b12"
    function_name              : "gcp-ref-py-demo-function-cloudfunction-cf4ebf7"
    function_trigger_url       : "https://us-central1-pulumi-ce-team.cloudfunctions.net/gcp-ref-py-demo-function-cloudfunction-cf4ebf7"
    network_subnets_cidr_blocks: [
        [0]: "10.0.0.0/25"
        [1]: "10.0.0.128/26"
        [2]: "10.0.0.192/26"
    ]
    network_subnets_names      : [
        [0]: "gcp-ref-py-demo-vpc-subnet-0-3ddaf53"
        [1]: "gcp-ref-py-demo-vpc-subnet-1-2c77fc4"
        [2]: "gcp-ref-py-demo-vpc-subnet-2-d9864be"
    ]
    network_vpc_name           : "gcp-ref-py-demo-vpc-dceecca"

    Resources:
        + 19 created

    Duration: 14m16s

1. To see the resources that were created, run `pulumi stack output`:

    ```bash
    $ pulumi stack output
    Current stack outputs (11):
    OUTPUT                       VALUE
    bucket_name                  gs://gcp-ref-py-demo-bucket-c2bea5c
    database_instance            gcp-ref-py-demo-database-dbinstance-a3461f1
    database_name                gcp-ref-py-demo-database-pulumidb-0cb3b5f
    database_user                pulumiadmin
    database_user_password       [secret]
    function_bucket_name         gcp-ref-py-demo-function-bucket-cc33b12
    function_name                gcp-ref-py-demo-function-cloudfunction-cf4ebf7
    function_trigger_url         https://us-central1-pulumi-ce-team.cloudfunctions.net/gcp-ref-py-demo-function-cloudfunction-cf4ebf7
    network_subnets_cidr_blocks  ["10.0.0.0/25","10.0.0.128/26","10.0.0.192/26"]
    network_subnets_names        ["gcp-ref-py-demo-vpc-subnet-0-3ddaf53","gcp-ref-py-demo-vpc-subnet-1-2c77fc4","gcp-ref-py-demo-vpc-subnet-2-d9864be"]
    network_vpc_name             gcp-ref-py-demo-vpc-dceecca

1. To see the vpc and subnets, run
 
    `pulumi stack output network_vpc_name`

     **gcp-ref-py-demo-vpc-dceecca**

    `pulumi stack output network_subnets_names`
    **["gcp-ref-py-demo-vpc-subnet-0-3ddaf53","gcp-ref-py-demo-vpc-subnet-1-2c77fc4","gcp-ref-py-demo-vpc-subnet-2-d9864be"]**
    
    `pulumi stack output network_subnets_cidr_blocks`
    **["10.0.0.0/25","10.0.0.128/26","10.0.0.192/26"]**

1.  To see the cloud sql postgres instance and database
    `pulumi stack output database_instance`

    **gcp-ref-py-demo-database-dbinstance-a3461f1**
    
    `pulumi stack output database_name`
    
    **gcp-ref-py-demo-database-pulumidb-0cb3b5f**

1. To see the url from the cloud function

   `curl $(pulumi stack output function_trigger_url)`

   Expected Output:
   **Hello from Pulumi World!**

