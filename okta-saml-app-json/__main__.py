import pulumi_okta as okta
import pulumi
from pulumi import Config, export

sourceemail = "tushar@pulumi.com"

config = Config()
accountid = config.get("awsaccountid")
iam_saml_provider = config.get("iamsamlprovider")
role = config.get("myrole")

# Creating identityProviderArn for app_setting_json
myidentityProviderArn = f"arn:aws:iam::{accountid}:saml-provider/{iam_saml_provider}"
# Creating roleValuePattern for app_setting_json
myroleValuePattern= f"arn:aws:iam::{accountid}:saml-provider/OKTA,arn:aws:iam::{accountid}:role/{role}"
# Creating groupFilter for app_setting_json
mygroupFilter = f"aws_(?{accountid}//d+)_(?{role}[a-zA-Z0-9+=,.@//-_]+)"

# Combing it all to create the app_setting_json
app_setting_json_total ='{' + f'''
            "appFilter":"okta",
            "awsEnvironmentType":"aws.amazon",
            "joinAllRoles": false,
            "sessionDuration": 14400,
            "loginURL": "https://console.aws.amazon.com/ec2/home",
            "identityProviderArn":"{myidentityProviderArn}",
            "roleValuePattern":"{myroleValuePattern}",
            "groupFilter":"{mygroupFilter}",
            "useGroupMapping": false
             ''' + '}'

okta_application = okta.app.Saml(
    "test_okta_application",
    attribute_statements=[okta.app.SamlAttributeStatementArgs(
        name="amazon_aws",
    )],
    honor_force_authn=False,
    label="AWS KS POC",
    features=[
        "PUSH_NEW_USERS",
        "PUSH_PROFILE_UPDATES"
    ],
    preconfigured_app="amazon_aws",
    user_name_template="tushar@pulumi.com",
    user_name_template_type="BUILT_IN",
    sso_url="https://dev-7962294.okta.com",
    recipient="https://dev-7962294.okta.com",
    destination="https://console.aws.amazon.com/ec2/home",
    audience="http://dev-7962294.okta.com/audience",
    response_signed=True,
    signature_algorithm="RSA_SHA256",
    digest_algorithm="SHA256",
    authn_context_class_ref="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    subject_name_id_template="tushar@pulumi.com",
    subject_name_id_format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    app_settings_json = app_setting_json_total
    )
    
export("SAML APP Name",okta_application.name)
export("SAML Sign On Mode",okta_application.sign_on_mode)
export("SAML Label", okta_application.label)
export("myidentityProviderArn", myidentityProviderArn)
export("myroleValuePattern", myroleValuePattern)
export("mygroupFilter", mygroupFilter)
export("app_setting_json_total", app_setting_json_total)