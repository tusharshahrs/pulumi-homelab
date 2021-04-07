from pulumi import ComponentResource, ResourceOptions
from pulumi_gcp import sql
import pulumi_random as random # Used for password generation https://www.pulumi.com/docs/reference/pkg/random/


class DbArgs:
    def __init__(self,
                 database_version="POSTGRES_12",
                 tier = "db-f1-micro",
                 activation_policy="ALWAYS",
                 availability_type="REGIONAL",
                 backup_configuration_enabled=True,
                 backup_configuration_point_in_time_recovery_enabled=True,
                 deletion_protection=False,
                 private_network = None,
                 tags = None,
                 disk_size = 20):

        self.database_version = database_version
        self.tier = tier
        self.activation_policy = activation_policy
        self.availability_type = availability_type
        self.backup_configuration_enabled = backup_configuration_enabled
        self.backup_configuration_point_in_time_recovery_enabled = backup_configuration_point_in_time_recovery_enabled
        self.deletion_protection=deletion_protection
        self.private_network=private_network
        self.disk_size=disk_size
        self.tags = tags

class Database(ComponentResource):
    def __init__(self,
                 name: str,
                 args: DbArgs,
                 opts: ResourceOptions = None):

        super().__init__('custom:resource:Postgres', name, {}, opts)
        database_instance_name = f'{name}-dbinstance'
        self.sql = sql.DatabaseInstance(database_instance_name,
            database_version=args.database_version,
            settings=sql.DatabaseInstanceSettingsArgs(
                tier = args.tier,
                activation_policy = args.activation_policy ,
                availability_type = args.availability_type,
                disk_size=args.disk_size,
                ip_configuration=args.private_network,
                user_labels = args.tags,
                backup_configuration = { "enabled":args.backup_configuration_enabled,
                                     "point_in_time_recovery_enabled": args.backup_configuration_point_in_time_recovery_enabled
                                   },
            ),
            deletion_protection=args.deletion_protection,
            opts=ResourceOptions(parent=self))

        # creates a random password https://www.pulumi.com/docs/reference/pkg/random/randompassword/
        mypassword = random.RandomPassword(f'{name}-random',
            length=12,
            special=False,
            lower = True,
            min_lower = 4,
            min_numeric = 4,
            min_upper = 4,
            number = True)

        users_name = f'{name}-user'
        self.users = sql.User(users_name,
            instance=self.sql.id,
            name="pulumiadmin",
            password=mypassword.result,
            opts=ResourceOptions(parent=self.sql))

        database_name = f'{name}-pulumidb'
        self.database = sql.Database(database_name,
            instance = self.sql.id,
            charset="UTF8",
            opts=ResourceOptions(parent=self.sql)
        )
        
        self.register_outputs({})