import pulumi
import pulumi_azuread as azuread

current = azuread.get_client_config()
pulumi.export("accountId", current.client_id)

example = azuread.User("shahtushar",
    display_name="ShahTAzureAD AzureAD",
    mail_nickname="ShahTZ",
    password="SecretP@sswd99!",
    user_principal_name="johndoes@pulumi.com")

pulumi.export("user email", example.mail)
pulumi.export("user id", example.id)
pulumi.export("user id", example.object_id)