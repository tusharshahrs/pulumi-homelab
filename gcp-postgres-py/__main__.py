"""A Google Cloud Python Pulumi program that stands up PostgresSQL"""

import pulumi
import pulumi_gcp as gcp # gcp https://www.pulumi.com/docs/reference/pkg/gcp/
from pulumi_gcp import sql, compute
import pulumi_postgresql as postgres  # PostgresSQL Provider https://www.pulumi.com/docs/reference/pkg/postgresql/ https://github.com/pulumi/pulumi-postgresql
import pulumi_random as random # Used for password generation https://www.pulumi.com/docs/reference/pkg/random/
import pg8000.native           # Used for creating table https://github.com/tlocke/pg8000name = "shaht"

from pulumi import Config   # To read from pulumi config:   Setting and Getting Configuration Values https://www.pulumi.com/docs/intro/concepts/config/#setting-and-getting-configuration-values

config=Config()  # To get Data from local config  
myip = config.get("myip")     # your ip with /32
myregion = gcp.config.region  # gcp region
name = "demo"

# The following config values are set via: https://www.pulumi.com/docs/reference/cli/pulumi_config_set/
# The following 4 inputs will be updated ONLY after the initial postgres sql database instance, database, and users have been created.
# We need the instance information to pass back in since we are using python package
# to create the tables. See the readme
# Start
postgres_sql_instance_public_ip_address=config.get("postgres_sql_instance_public_ip_address")
postgres_sql_user_username=config.get("postgres_sql_user_username")
postgres_sql_database_name=config.get("postgres_sql_database_name")
postgres_sql_user_password=config.get("postgres_sql_user_password")
# End

# creates a random password https://www.pulumi.com/docs/reference/pkg/random/randompassword/
mypassword = random.RandomPassword("randompassword",
    length=12,
    special=False,
    lower = True,
    min_lower = 4,
    min_numeric = 4,
    min_upper = 4,
    number = True)

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

# Postgres https://www.pulumi.com/docs/reference/pkg/postgresql/
# provider: https://www.pulumi.com/docs/reference/pkg/postgresql/provider/
postgres_provider = postgres.Provider("postgres-provider",
  host=myinstance.public_ip_address,
  username=users.name,
  password=users.password,
  port=5432,
  superuser=True)

# creates a database on the instance in google cloud with the provider we created
mydatabase = postgres.Database("pulumi-votes-database",
   encoding="UTF8",
   opts=pulumi.ResourceOptions(provider=postgres_provider)
)

# Table creation/deletion is via pg8000 https://github.com/tlocke/pg8000
def tablecreation(mytable_name):
    print("Entered mytablecreation with:", mytable_name)
    create_first_part = "CREATE TABLE IF NOT EXISTS"
    create_sql_querty = "(id serial PRIMARY KEY, email VARCHAR ( 255 ) UNIQUE NOT NULL, api_key VARCHAR ( 255 ) NOT NULL)"
    create_combined = f'{create_first_part} {mytable_name}{create_sql_querty}'
    print("tablecreation create_combined_sql ", create_combined)
    myconnection=pg8000.native.Connection(
        host=postgres_sql_instance_public_ip_address,
        port=5432,
        user=postgres_user,
        password=postgres_user_pwd,
        database=postgressql_database_name
    )
    print("tablecreation starting")
    cursor=myconnection.run(create_combined)
    print("Table Created", mytable_name)
    selectversion = 'SELECT version();'
    cursor2=myconnection.run(selectversion)
    print("SELECT Version:", cursor2)

def droptable(table_to_drop):
    first_part_of_drop= "DROP TABLE IF EXISTS "
    last_part_of_drop= ' CASCADE'
    combinedstring = f'{first_part_of_drop} {table_to_drop} {last_part_of_drop}'
    conn=pg8000.native.Connection(
        host=postgres_sql_instance_public_ip_address,
        port=5432,
        user=postgres_user,
        password=postgres_user_pwd,
        database=postgressql_database_name
        )
    print("droptable delete_combined_sql ", combinedstring)
    cursor=conn.run(combinedstring)
    print("droptable completed ", cursor)

# Stack Outputs https://www.pulumi.com/docs/intro/concepts/stack/#outputs
pulumi.export("random_password", mypassword.result)
pulumi.export("Postgres_SQL_Instance", myinstance.name)
pulumi.export("Postgres_SQL_Database_Name", mydatabase.name)
pulumi.export("Postgres_SQL_Database_Schema", myvote_tables.id)
pulumi.export("Postgres_SQL_Instance_Public_Ip_Address", postgres_provider.host)
pulumi.export("Postgres_SQL_Instance_Port", postgres_provider.port)
pulumi.export("Postgres_SQL_User_Username", users.name)
pulumi.export("Postgres_SQL_User_Password", users.password)
pulumi.export("gcp_region", myregion)

# The creating_table  & deleting_table need to be commented out until after the 1st time
# you run `pulumi up`. The calls have 2 ##'s below. See Readme
create_table = "votertable"
##creating_table = tablecreation(create_table)
create_table = "location"
##creating_table = tablecreation(create_table)
drop_table = "mytable"
##deleting_table = droptable(drop_table)