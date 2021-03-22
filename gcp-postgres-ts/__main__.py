"""A Google Cloud Python Pulumi program"""
import pulumi
from pulumi_gcp import sql
from pulumi_gcp import compute
from pulumi import Config
import pulumi_gcp as gcp
import pulumi_postgresql as postgres
import pulumi_random as random

name = "shaht"

config=Config()
myip = config.get("myip")
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

# CREATE TABLE users (id uuid, email varchar(255), api_key varchar(255);
def create_tables():
    creation_script = """
        CREATE TABLE userstable (
            id serial PRIMARY KEY,
            email VARCHAR ( 255 ) UNIQUE NOT NULL,
            api_key VARCHAR ( 255 ) NOT NULL
            created_on TIMESTAMP NOT NULL,
            last_login TIMESTAMP 
        )
        INSERT INTO userstable(id, email, api_key, created_on, last_login) VALUES (0,0);
        INSERT INTO userstable(id, email, api_key, created_on, last_login) VALUES (1,0);
        INSERT INTO userstable(id, email, api_key, created_on, last_login) VALUES (2,0);
        INSERT INTO userstable(id, email, api_key, created_on, last_login) VALUES (3,0);
        INSERT INTO userstable(id, email, api_key, created_on, last_login) VALUES (4,0);
    """

# DELETE TABLE users
deletion_script = "DROP TABLE userstable CASCADE"

# https://www.pulumi.com/docs/reference/pkg/postgresql/schema/
myvote_tables = postgres.Schema("pulumischema",
                database=mydatabase.name,
                if_not_exists = True,
                name = "usertable",
                owner=postgres_provider.username,
                opts=pulumi.ResourceOptions(provider=postgres_provider)
                )

pulumi.export("PostgresSQL_Instance", myinstance.name)
pulumi.export("Postgres_Database", mydatabase.name)
pulumi.export("Postgres_Database_schema", myvote_tables.id)
pulumi.export("Postgres_Users", users.name)
pulumi.export("Postgres_Users_Password", users.password)
