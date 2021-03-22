"""A Google Cloud Python Pulumi program"""
import pulumi
from pulumi_gcp import sql
from pulumi_gcp import compute
import pulumi_gcp as gcp
import pulumi_postgresql as postgres
import pulumi_random as random

name = "shaht"


#creates a random password
# https://www.pulumi.com/docs/reference/pkg/random/
# https://www.pulumi.com/docs/reference/pkg/random/randompassword/
mypassword = random.RandomPassword("randompassword",
    length=12,
    special=False,
    lower = True,
    min_lower = 4,
    min_numeric = 4,
    min_upper = 4,
    number = True)

#  Start Creating Network
my_network = gcp.compute.Network(f'{name}-network', 
    auto_create_subnetworks = False,
    description=f'{name}-network',
)

# #  Creating Subnets
subnets = []
config = pulumi.Config()
subnet_cidr_blocks = config.get_object('subnet_cidr_blocks')

for i, the_ip_cidr_range in enumerate(subnet_cidr_blocks):
    subnet = compute.Subnetwork(f'{name}-subnet-{i}',
                                network=my_network.self_link,
                                ip_cidr_range= the_ip_cidr_range)
    subnets.append(subnet)

# # Creating Router
my_router = compute.Router(f'{name}-router',
                        network=my_network.self_link)
# # Creating Nat
my_nat = compute.RouterNat(f'{name}-routernat',
                        router=my_router.name,
                        nat_ip_allocate_option="AUTO_ONLY",
                        source_subnetwork_ip_ranges_to_nat="ALL_SUBNETWORKS_ALL_IP_RANGES")

#  End Creating Network
pulumi.export("network_name", my_network.name)
pulumi.export("random_password", mypassword.result)


# Create database instance Google Cloud.
myinstance = sql.DatabaseInstance(  
    "pulumidbinstance",
    database_version="POSTGRES_12",
    settings=sql.DatabaseInstanceSettingsArgs(
        tier ="db-f1-micro",
        activation_policy="ALWAYS",
        availability_type="REGIONAL",
        backup_configuration={
            "enabled": True,
            "point_in_time_recovery_enabled": True,
        },
    ),
    deletion_protection=False,
    #ip_configuration=sql.DatabaseInstanceSettingsIpConfigurationArgs(authorized_networks=["value":"10.0.0.0/24"])),
)

# Creating a user on gcp
users = sql.User("users",
    instance=myinstance.name,
    name = "pulumiadmin",
    password = "H1l7yGwY12aA")
    #password=mypassword.result)

# Postgres https://www.pulumi.com/docs/reference/pkg/postgresql/
# provider: https://www.pulumi.com/docs/reference/pkg/postgresql/provider/
postgres_provider = postgres.Provider("postgres-provider",
  host=myinstance.public_ip_address,
 # host=myinstance.connection_name,
  #host = myinstance.name,
  #host = myinstance.private_ip_address,
  username=users.name,
  password=users.password,
  port=5432,
  superuser=True)

# creates a database on the instance in google cloud via provider
mydatabase = postgres.Database("pulumi-votes-database",
   encoding="UTF8",
   opts=pulumi.ResourceOptions(provider=postgres_provider)
)  


# Postgres create an admin user
# provider: using the dynmamic provider
postgres_users = postgres.Role("pulumi-votesdatabase-user",
    name="pulumiuser",
    password="H1l7yGwY12aB",
    login=True,
    inherit=True,
    replication=True,
    superuser=False,
    opts=pulumi.ResourceOptions(provider=postgres_provider)
    )

"""
# PostGres granting access to user
# https://www.pulumi.com/docs/reference/pkg/postgresql/grant/
postgres_grant = postgres.Grant("postgres-grant",
    database=mydatabase.name,
    object_type = "database",
    privileges= ["SELECT", "INSERT", "DELETE", "TRIGGER", "CREATE", "CONNECT","TEMPORARY", "EXECUTE", "USAGE"],
    #privileges= ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "CREATE", "CONNECT","TEMPORARY", "EXECUTE", "USAGE"],
    role=postgres_users.name,
    opts=pulumi.ResourceOptions(provider=postgres_provider)
)
"""

# CREATE TABLE users (id uuid, email varchar(255), api_key varchar(255);


"""pulumi.export("PostgresSQL Database:", mydatabase.name)
pulumi.export("PostgresSQL User:    ", users.name)
pulumi.export("PostgresSQL User:    ", users.password)

pulumi.export("Postgres_Provider_Host", postgres_provider.host)
pulumi.export("Postgres_Provider_Id", postgres_provider.id)
pulumi.export("Postgres_Provider_Username", postgres_provider.username)

pulumi.export("PostgresSQL_Instance", myinstance.name)
pulumi.export("Random_Password", mypassword.result)
pulumi.export("Postgres_Database", mydatabase.name)
"""

pulumi.export("PostgresSQL_Instance", myinstance.name)
pulumi.export("Postgres_Provider_Id", postgres_provider.id)
pulumi.export("Postgres_Database", mydatabase.name)