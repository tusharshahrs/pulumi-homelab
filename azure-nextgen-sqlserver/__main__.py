import pulumi
import pulumi_azure_nextgen as azure_nextgen
from pulumi_azure_nextgen.resources import latest as resources
from pulumi import Config, Output, export

config = pulumi.Config()
location_param = config.get("locationParam")
resource_group_name_param = config.require("resourceGroupNameParam")
vulnerability_assessments_default_storage_container_path_param = config.require("vulnerabilityAssessmentsDefaultStorageContainerPathParam")
#resource_group_name=resource_group_name_param

database_tags = {"created-by": "tusharshah",
                "creationSource": "pulumiapi",
                "owner": "team-qa",
                "purpose": "test template",
                "env": "dev"}

resource_group = resources.ResourceGroup("shaht-rg",
    location = location_param,
    resource_group_name=resource_group_name_param)

administrator_login_param = config.require("administratorLoginParam")
administrator_login_password_param = config.require_secret("administratorLoginPasswordParam")
server_name_param = config.require("serverNameParam")
sql_db_name_param = config.get("sqlDBNameParam")

advisor_resource = None
auditing_policy_resource = None
encryption_protector_resource = None
geo_backup_policy_resource = None
security_alert_policy_resource = None
transparent_data_encryption_resource = None
vulnerability_assessment_resource = None

server_resource = azure_nextgen.sql.latest.Server("serverResource",
    location=location_param,
    resource_group_name=resource_group.name,
    administrator_login=administrator_login_param,
    administrator_login_password=administrator_login_password_param,
    tags=database_tags,
    version="12.0",
    server_name=server_name_param,
    )

database_resource = azure_nextgen.sql.latest.Database("databaseResource",
    location=location_param,
    database_name= f"{server_name_param}-{sql_db_name_param}",
    resource_group_name=resource_group.name,
    server_name=server_resource.name,
    tags=database_tags,
)

#key_resource = azure_nextgen.sql.v20150501preview.ServerKey("keyResource",
#    key_name=f"{server_name_param}/ServiceManaged",
#    kind="servicemanaged",
#    resource_group_name=resource_group.name,
#    server_name=server_resource.name,
#    server_key_type="ServiceManaged")

#vulnerability_assessment_resource = azure_nextgen.sql.v20180601preview.ServerVulnerabilityAssessment("vulnerabilityAssessmentResource",
#    resource_group_name=resource_group.name,
#    server_name=server_resource.name,
#    storage_container_path=vulnerability_assessments_default_storage_container_path_param,
#    vulnerability_assessment_name=f"{server_name_param}/Default",
#    recurring_scans={
#        "email_subscription_admins": True,
#        "is_enabled": False,
#    },
#)

# The end IP address of the firewall rule. Must be IPv4 format. Must be greater than or equal to startIpAddress. Use value '0.0.0.0' to represent all Azure-internal IP addresses.
# The start IP address of the firewall rule. Must be IPv4 format. Use value '0.0.0.0' to represent all Azure-internal IP addresses.
#
#v20150501preview
firewall_rule_resource = azure_nextgen.sql.v20150501preview.FirewallRule("firewallRuleResource",
    end_ip_address="0.0.0.0",
    firewall_rule_name=f"{server_name_param}-AllowAllWindowsAzureIps",
    resource_group_name=resource_group.name,
    server_name=server_resource.name,
    #resource_group_name=resource_group_name_param,
    #server_name=server_name_param,
    start_ip_address="0.0.0.0")

export("resource group",resource_group.name)
#export("database name",database_resource.name)
#export("database status",database_resource.status)
export("sqlserver name",server_resource.name)
export("sqlserver state",server_resource.state)
export("sqlserver fqdn",server_resource.fully_qualified_domain_name)