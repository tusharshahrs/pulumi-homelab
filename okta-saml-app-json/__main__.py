"""A Python Pulumi program"""
import pulumi
import pulumi_okta as okta
from pulumi import Config

example = okta.app.Saml("example",
    attribute_statements=[okta.app.SamlAttributeStatementArgs(
        filter_type="REGEX",
        filter_value=".*",
        name="groups",
        type="GROUP",
    )],
    audience="http://example.com/audience",
    authn_context_class_ref="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    destination="http://example.com",
    digest_algorithm="SHA256",
    honor_force_authn=False,
    label="example",
    recipient="http://example.com",
    response_signed=True,
    signature_algorithm="RSA_SHA256",
    sso_url="http://example.com",
    subject_name_id_format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    subject_name_id_template="tushar@pulumi.com")

#config = Config()
#accountid = config.require("awsaccountid")
""" sourceemail = "tushar@pulumi.com"
# shahexample = okta.app.Saml(
self.okta_application = okta.app.Saml(
    "shahshahexample",
    attribute_statements=[okta.app.SamlAttributeStatementArgs(
        name="amazon_aws",
        # name="shahtushar_okta_bot",
        # name="groups",
        # type="GROUP",
    )],
    honor_force_authn=False,
    label="Tushar Shah Okta Bot",
    features=[
        "PUSH_NEW_USERS",
        "PUSH_PROFILE_UPDATES"
    ],
    user_name_template="${sourceemail}",
    user_name_template_type="BUILT_IN",
    sso_url="https://test.okta.com",
    recipient="https://test.okta.com",
    destination="https://console.aws.amazon.com/ec2/home",
    audience="http://test.okta.com/audience",
    response_signed=True,
    signature_algorithm="RSA_SHA256",
    digest_algorithm="SHA256",
    authn_context_class_ref="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    subject_name_id_template="${sourceemail}",
    subject_name_id_format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    opts=ResourceOptions(parent=self.provider),
    app_settings_json='''{
        "appFilter": "okta",
        "groupFilter": "aws_(?{{accountid}}\\d+)_(?{{role}}[a-zA-Z0-9+=,.@\\-_]+)",
        "useGroupMapping": false,
        "joinAllRoles": false,
        "identityProviderArn": "arn:aws:iam::${accountid}:saml-provider/Kenshoo-Okta",
        "sessionDuration": 14400,
        "roleValuePattern": "arn:aws:iam::${accountid}:saml-provider/OKTA,arn:aws:iam::${accountid}:role/${role}",
        "awsEnvironmentType": "aws.amazon",
        "loginURL": "https://console.aws.amazon.com/ec2/home
        }'''
)
 """