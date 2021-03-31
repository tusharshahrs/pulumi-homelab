"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi import ResourceOptions, Output
from pulumi_gcp import storage, bigtable
from config import getResourceName, subnet_cidr_blocks, project
import network
import postgres
import pulumi_random as random

# creating project name tag
projectName = pulumi.get_project()

# creating stack name tag
stackName = pulumi.get_stack()

commonTags = {
    "project": projectName,
    "stack": stackName,
}

# Create a GCP resource (Storage Bucket)
# With no getresourcename
#bucket = storage.Bucket('shaht-my-bucket', labels=commonTags)
# Expected output: gs://shaht-my-bucket-7477081
myname = "demo"

bucket = storage.Bucket(getResourceName(f"{myname}-bucket"), labels=commonTags)
# Expected output:  gs://gcp-reference-architecture-py-shaht-my-bucket-b89e42f

#bucket = storage.Bucket(getResourceName(), labels=commonTags)
# Expected output: gs://gcp-reference-architecture-py-1d70b6d

#mynetwork = network.Vpc("shaht-vpc", network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
#mynetwork = network.Vpc(getResourceName(), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
mynetwork = network.Vpc(getResourceName(f"{myname}-vpc"), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
mydatabase = postgres.Database(getResourceName(f"{myname}-database"), postgres.DbArgs(private_network=mynetwork.id))

#  Creating subnet and cidr block outputs
my_subnet_names = []
my_subnet_cidrs_blocks = []

my_subnet_names.append(mynetwork.subnets[0].name.apply(lambda subnet: subnet))
my_subnet_names.append(mynetwork.subnets[1].name.apply(lambda subnet: subnet))
my_subnet_names.append(mynetwork.subnets[2].name.apply(lambda subnet: subnet))

my_subnet_cidrs_blocks.append(mynetwork.subnets[0].ip_cidr_range.apply(lambda subnet: subnet))
my_subnet_cidrs_blocks.append(mynetwork.subnets[1].ip_cidr_range.apply(lambda subnet: subnet))
my_subnet_cidrs_blocks.append(mynetwork.subnets[2].ip_cidr_range.apply(lambda subnet: subnet))


# Export the DNS name of the bucket
pulumi.export('bucket_name', bucket.url)

# Export the vpc information
pulumi.export('network_vpc_name', mynetwork.network.name)
# Export the subnet names and cidr blocks
pulumi.export('network_subnets_names',my_subnet_names)
pulumi.export('network_subnets_cidr_blocks',my_subnet_cidrs_blocks)
pulumi.export('database_instance', mydatabase.sql.name)
pulumi.export('database_user', mydatabase.users.name)
pulumi.export('database_user_password', mydatabase.users.password)
pulumi.export('database_name', mydatabase.database.name)

# Export BigTable Instance
##pulumi.export('bigtable_table_instance_name',mybigtableinstance.name)
#pulumi.export('bigtable_table_instance_cluster',mybigtableinstance.clusters.name)
# Export the Table
##pulumi.export('bigtable_table_name',mybigtable.name)
##pulumi.export('bigtable_table_split_keys',mybigtable.split_keys)
##pulumi.export('bigtable_instance_name',mybigtable.instance_name)

# Required for datastore
""" myappengine = appengine.Application(getResourceName("shahtappengine"),
                                    location_id="us-central",
                                    database_type="CLOUD_DATASTORE_COMPATIBILITY"),

mydatastore = datastore.DataStoreIndex(getResourceName("shaht-datastore"),
                                       kind="pulumi-reference-stack",
                                       properties=[
    datastore.DataStoreIndexPropertyArgs(
        direction="ASCENDING",
        name="property_a",
    ),
    datastore.DataStoreIndexPropertyArgs(
        direction="ASCENDING",
        name="property_b",
    ),
]
) """

# Big table requires the zone location
# https://cloud.google.com/bigtable/docs/locations
# Need two zones
""" zone_letter1 = "b"
zone_letter2 = "c"
myregion = "us-central1"
zone1 = f"{myregion}-{zone_letter1}"
zone2 = f"{myregion}-{zone_letter2}"
# Two zones
pulumi.export("big_table_cluster1_zone", zone1)
pulumi.export("big_table_cluster2_zone", zone2) """

"""myrandom = random.RandomString("random",
    length=4,
    lower=True,
    upper=False,
    min_numeric=2,
    special=False)

suffix = myrandom.result
pulumi.export("suffix",suffix)"""

"""clustername1 = Output.concat(myname,"-cluster-",zone_letter1,"-",suffix)
clustername2 = Output.concat(myname,"-cluster-",zone_letter2,"-",suffix)"""

#https://cloud.google.com/bigtable/docs/locations
# Big table naming issue:  https://github.com/GoogleCloudPlatform/k8s-config-connector/issues/174
# This means you have to pass in a random cluster id.
"""
mybigtableinstance = bigtable.Instance(getResourceName(f"{myname}-bigtb"),
    clusters=[
    bigtable.InstanceClusterArgs(
        cluster_id=clustername1,
        num_nodes=1,
        zone=f"{zone1}",
        storage_type="HDD",
    ),
    bigtable.InstanceClusterArgs(
        cluster_id=clustername2,
        num_nodes=1,
        zone=f"{zone2}",
        storage_type="HDD",
    )
    
    ],
    deletion_protection=False,
    labels={
        "team": "ce-team",
        "gui_setup": "no",
        "pulumi": "yes",
        "env": "dev",
        "highly_available" :"yes",
        "multi_clustered": "yes",
        }
)

mybigtable = bigtable.Table(getResourceName(f"{myname}-table"),
 instance_name=mybigtableinstance.id,
 split_keys=["area_code", "zip_code","city"],
 opts=ResourceOptions(parent=mybigtableinstance)
)
"""