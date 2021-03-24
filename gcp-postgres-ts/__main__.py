"""A Google Cloud Python Pulumi program that stands up PostgresSQL"""
import pulumi
from pulumi_gcp import sql, compute
from pulumi import Config, get_project, Output # To read from pulumi config

import pulumi_gcp as gcp # gcp https://www.pulumi.com/docs/reference/pkg/gcp/
import pulumi_postgresql as postgres  # PostgresSQL Provider https://www.pulumi.com/docs/reference/pkg/postgresql/ https://github.com/pulumi/pulumi-postgresql
import pulumi_random as random # Used for password generation https://www.pulumi.com/docs/reference/pkg/random/
import pg8000.native           # Used for creating table https://github.com/tlocke/pg8000name = "shaht"
import time

config=Config()
myip = config.get("myip")
postgres_sql_instance_public_ip_address=config.get("postgres_sql_instance_public_ip_address")
postgres_user=config.get("postgres_user")
postgres_database=config.get("postgres_database")
postgres_user_pwd=config.get("postgres_user_pwd")
myproject = get_project()
myregion = gcp.config.region
name = "shaht"

postgres_sql_instance_public_ip_address
# creates a random password https://www.pulumi.com/docs/reference/pkg/random/randompassword/
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
    print("Entered mytablecreation with:", mytable_name)
    create_first_part = "CREATE TABLE IF NOT EXISTS"
    create_sql_querty = "(id serial PRIMARY KEY, email VARCHAR ( 255 ) UNIQUE NOT NULL, api_key VARCHAR ( 255 ) NOT NULL)"
    create_combined = f'{create_first_part} {mytable_name}{create_sql_querty}'
    print("mytablecreation create_combined_sql ", create_combined)
    myconnection=pg8000.native.Connection(
        host=postgres_sql_instance_public_ip_address,
        port=5432,
        user=postgres_user,
        password=postgres_user_pwd,
        database=postgres_database
    )
    print("mytablecreation starting")
    cursor=myconnection.run(create_combined)
    print("Table Created", cursor)
    selectversion = 'SELECT version();'
    cursor2=myconnection.run(selectversion)
    print("SELECT Version:", cursor2)

def mydroptable(table_to_drop):
    first_part_of_drop= "DROP TABLE IF EXISTS "
    last_part_of_drop= ' CASCADE'
    combinedstring = f'{first_part_of_drop} {table_to_drop} {last_part_of_drop}'
    conn=pg8000.native.Connection(
        host=postgres_sql_instance_public_ip_address,
        port=5432,
        user=postgres_user,
        password=postgres_user_pwd,
        database=postgres_database
        )
    print("mydroptable delete_combined_sql ", combinedstring)
    cursor=conn.run(combinedstring)

pulumi.export("Postgres_SQL_Instance", myinstance.name)
pulumi.export("Postgres_SQL_Database_Name", mydatabase.name)
pulumi.export("Postgres_SQL_Database_Schema", myvote_tables.id)
pulumi.export("Postgres_SQL_Instance_Public_Ip_Address", postgres_provider.host)
pulumi.export("Postgres_SQL_Instance_Port", postgres_provider.port)

pulumi.export("Postgres_SQL_User_Username", users.name)
pulumi.export("Postgres_SQL_User_Password", users.password)
pulumi.export("gcp_region", myregion)

create_table = "mytable1"
creating_table = mytablecreation(create_table)

create_table2 = "mytable2"
creating_table = mytablecreation(create_table2)

drop_table = "mytable2"
deleting_table = mydroptable(drop_table)

#CREATE TABLE IF NOT EXISTS usertable.shahtable(id serial PRIMARY KEY, email VARCHAR ( 255 ) UNIQUE NOT NULL, api_key VARCHAR ( 255 ) NOT NULL)