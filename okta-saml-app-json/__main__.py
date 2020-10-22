import pulumi_okta as okta
import pulumi
from pulumi import Config

#aws_lab = okta.app.Saml.get("amazon_aws", "0oa22s7vymiGXZbLr1t7")
sourceemail = "tushar@pulumi.com"

config = Config()
accountid = config.get("awsaccountid")

#user = okta.app.User("exampleuser",
#    app_id = "0oad3g1tU4Tq3yOX95d5",
#    user_id = "00ucyhfiZaIXZGdUJ5d5",
#    username = "tushar@pulumi.com")

okta_application = okta.app.Saml(
    "test_okta_application",
    attribute_statements=[okta.app.SamlAttributeStatementArgs(
        name="amazon_aws",
        #filter_type  = "REGEX",
        #filter_value = ".*",
        #type         = "GROUP"
    )],
    honor_force_authn=False,
    label="AWS Ks Poc",
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
    app_settings_json="""
            {
            "appFilter": "okta",
            "awsEnvironmentType": "aws.amazon",
            "joinAllRoles": false,
            "loginURL": "https://console.aws.amazon.com/ec2/home",
            "roleValuePattern": "arn:aws:iam::${accountid}:saml-provider/OKTA,arn:aws:iam::${accountid}:role/${role}",
            "sessionDuration": 3600,
            "groupFilter": "aws_(?{{accountid}}//d+)_(?{{role}}[a-zA-Z0-9+=,.@//-_]+)",
            "identityProviderArn": "arn:aws:iam::{accountid}:saml-provider/some-name",
            "useGroupMapping": false   
            }
            """
    )