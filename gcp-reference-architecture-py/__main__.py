"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage, bigtable
from config import getResourceName, subnet_cidr_blocks, project
import network
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
myname = "ce-demo"

bucket = storage.Bucket(getResourceName(f"{myname}-bucket"), labels=commonTags)
# Expected output:  gs://gcp-reference-architecture-py-shaht-my-bucket-b89e42f

#bucket = storage.Bucket(getResourceName(), labels=commonTags)
# Expected output: gs://gcp-reference-architecture-py-1d70b6d

#mynetwork = network.Vpc("shaht-vpc", network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
#mynetwork = network.Vpc(getResourceName(), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))
mynetwork = network.Vpc(getResourceName(f"{myname}-vpc"), network.VpcArgs(subnet_cidr_blocks=subnet_cidr_blocks,))

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


zonelocations = random.RandomShuffle(f"{myname}-bigtable-zonelocations",
    inputs=[
        "a",
        "b",
        "c",
    ],
    result_count=1)

myzoneletter = zonelocations.results

mybigtableinstance = bigtable.Instance(getResourceName(f"{myname}-bigtable"),
    clusters=[bigtable.InstanceClusterArgs(
        cluster_id=f"{myname}-instance-cluster",
        num_nodes=1,
        zone=f"us-central1-{myzoneletter}",
        storage_type="HDD",
    )],
    labels={"team": "ce-team",
            "gui": "no",
            "pulumi": "yes",
            "env": "dev",}
)

mybigtable = bigtable.Table(f"{myname}-table",
 instance_name=mybigtableinstance.id,
 split_keys=["area_code", "zip_code","city"],
)

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
pulumi.export('vpc_name', mynetwork.network.name)
pulumi.export('network_project', mynetwork.network.project)
# Export the subnet names and cidr blocks
pulumi.export('subnets_names',my_subnet_names)
pulumi.export('subnets_cidr_blocks',my_subnet_cidrs_blocks)

# Export the app engine
#pulumi.export("app_engine_name", myappengine.name)
# Export the Datastore Index
#pulumi.export("datastore_index", mydatastore.id)
#pulumi.export("datastore_index2", mydatastore.index_id)
