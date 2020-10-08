import pulumi
import pulumi_azure_nextgen as azure_nextgen
from pulumi_azure_nextgen.resources import latest as resources
from pulumi import Config, Output, export

config = pulumi.Config()
location_param = config.get("locationParam")
resource_group_name_param = config.require("resourceGroupNameParam")

database_tags = {"created-by": "tusharshah",
                "creationSource": "pulumiapi",
                "owner": "team-qa",
                "purpose": "test template",
                "env": "dev"}

resource_group = resources.ResourceGroup("shaht-rg",
    location = f"{location_param}",
    resource_group_name=f"{resource_group_name_param}")

administrator_login_param = config.require("administratorLoginParam")
administrator_login_password_param = config.require_secret("administratorLoginPasswordParam")
server_name_param = config.require("serverNameParam")
sql_db_name_param = config.get("sqlDBNameParam")

database_resource = azure_nextgen.sql.latest.Database("mydbResource",
    location=location_param,
    database_name= f"{server_name_param}-{sql_db_name_param}",
    resource_group_name=resource_group_name_param,
    server_name=server_name_param,
    tags=database_tags,
)

server_resource = azure_nextgen.sql.latest.Server("mysqlserver",
    location=location_param,
    resource_group_name=resource_group_name_param,
    administrator_login=administrator_login_param,
    administrator_login_password=administrator_login_password_param,
    tags=database_tags,
    version="12.0",
    server_name=server_name_param,
    )


export("resource group",resource_group.name)
export("database name", database_resource.name)
#export("database id", database_resource.id)
export("database status", database_resource.status)
#export("server_id", server_resource.id)
export("server_name", server_resource.name)
export("server_state", server_resource.state)
export("server_fqdn", server_resource.fully_qualified_domain_name)