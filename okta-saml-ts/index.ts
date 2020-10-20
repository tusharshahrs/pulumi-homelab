import * as pulumi from "@pulumi/pulumi";
import * as okta from "@pulumi/okta";

const userName = "tushar@pulumi.com"
const example = new okta.app.Saml("example", {
    attributeStatements: [{
        filterType: "REGEX",
        filterValue: ".*",
        name: "groups",
        type: "GROUP",
    }],
    audience: "http://example.com/audience",
    authnContextClassRef: "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
    destination: "http://example.com",
    digestAlgorithm: "SHA256",
    honorForceAuthn: false,
    label: "example",
    recipient: "http://example.com",
    responseSigned: true,
    signatureAlgorithm: "RSA_SHA256",
    ssoUrl: "http://example.com",
    subjectNameIdFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    subjectNameIdTemplate: "${userName}",
    //subjectNameIdTemplate: "${user.userName}",
});
