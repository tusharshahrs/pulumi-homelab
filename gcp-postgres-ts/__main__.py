"""A Google Cloud Python Pulumi program"""
import pulumi
from pulumi_gcp import sql
from pulumi_gcp import compute
from pulumi import Config, get_project, Output
import pulumi_gcp as gcp
import pulumi_postgresql as postgres
import pulumi_random as random
import pg8000.native

name = "shaht"

config=Config()
myip = config.get("myip")
myproject = get_project()
myregion = gcp.config.region
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
# https://www.pulumi.com/docs/reference/pkg/gcp/sql/databaseinstance/
myinstance = sql.DatabaseInstance(  
    "pulumidbinstance",
    database_version="POSTGRES_12",
    settings=sql.DatabaseInstanceSettingsArgs(
        tier ="db-f1-micro",
        activation_policy="ALWAYS",
        availability_type="REGIONAL",
        ip_configuration={ "authorized_networks":[{"value": myip}]},
        backup_configuration={
            "enabled": True,
            "point_in_time_recovery_enabled": True,
        },
    ),
    deletion_protection=False,
)

# Creating a user on gcp
# https://www.pulumi.com/docs/reference/pkg/gcp/sql/user/
users = sql.User("users",
    instance=myinstance.name,
    name = "pulumiadmin",
    password=mypassword.result)

# Postgres https://www.pulumi.com/docs/reference/pkg/postgresql/
# provider: https://www.pulumi.com/docs/reference/pkg/postgresql/provider/
postgres_provider = postgres.Provider("postgres-provider",
  host=myinstance.public_ip_address,
  username=users.name,
  password=users.password,
  port=5432,
  superuser=True)

# creates a database on the instance in google cloud via provider
mydatabase = postgres.Database("pulumi-votes-database",
   encoding="UTF8",
   opts=pulumi.ResourceOptions(provider=postgres_provider)
)  

# https://www.pulumi.com/docs/reference/pkg/postgresql/schema/
myvote_tables = postgres.Schema("pulumischema",
                database=mydatabase.name,
                if_not_exists = True,
                owner=postgres_provider.username,
                name = "usertable",
                opts=pulumi.ResourceOptions(provider=postgres_provider)
                )

# Table creation: https://github.com/tlocke/pg8000
def mytablecreation(mytable_name):
    conn=pg8000.native.Connection(
        host='34.68.194.53',
        port=5432,
        user='pulumiadmin',
        password='KSs3wTu435kR',
        database='pulumi-votes-database-c53f1ca'
        )

    create_first_part = "CREATE TABLE IF NOT EXISTS"
    create_sql_querty = "(id serial PRIMARY KEY, email VARCHAR ( 255 ) UNIQUE NOT NULL, api_key VARCHAR ( 255 ) NOT NULL)"
    create_combined = f'{create_first_part} {mytable_name}{create_sql_querty}'
    cursor=conn.run(create_combined)

def mydroptable(table_to_drop):
    conn=pg8000.native.Connection(
        host='34.68.194.53',
        port=5432,
        user='pulumiadmin',
        password='KSs3wTu435kR',
        database='pulumi-votes-database-c53f1ca'
        )
    first_part_of_drop= "DROP TABLE IF EXISTS "
    last_part_of_drop= ' CASCADE'
    combinedstring = f'{first_part_of_drop} {table_to_drop} {last_part_of_drop}'
    cursor=conn.run(combinedstring)

pulumi.export("PostgresSQL_Instance", myinstance.name)
pulumi.export("Postgres_Database", mydatabase.name)
pulumi.export("Postgres_Database_schema", myvote_tables.id)
pulumi.export("PostgresSQL_Instance_public_ip", postgres_provider.host)
pulumi.export("Postgres_Users", users.name)
pulumi.export("Postgres_Users_Password", users.password)
pulumi.export("Myregion", myregion)

create_table = "votertable"
print("Creating Table start")
creating_table = mytablecreation(create_table)
print("Creating Table finished")

"""drop_table = "tushar12"
print("Dropping Table start")
deleting_table = mydroptable(drop_table)
print("Dropping Table finished")"""

#CREATE TABLE IF NOT EXISTS usertable.shahtable(id serial PRIMARY KEY, email VARCHAR ( 255 ) UNIQUE NOT NULL, api_key VARCHAR ( 255 ) NOT NULL)