import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";
import { StackReference, Config } from "@pulumi/pulumi";
import { OrganizationalUnit } from "@pulumi/aws/organizations";
//import * as AWS from 'aws-sdk';

const config = new pulumi.Config();
const mystackreference = new StackReference(config.require("sshkeystack"));
const my_privatekey = mystackreference.getOutput("sshkey_privateKeyPem");
const my_certpem = mystackreference.getOutput("certrequest_pem");

/*const exampleCertificateAuthority = new aws.acmpca.CertificateAuthority("exampleCertificateAuthority", {
    certificateAuthorityConfiguration: {
        keyAlgorithm: "RSA_4096",
        signingAlgorithm: "SHA512WITHRSA",
        subject: {
            commonName: "shahtexample.com",
            organization: "pulumi-ce",
            organizationalUnit: "customer-engineering",
            state: "WA",
            locality: "Seattle",
            title: "pulumi",
        },

    },
    revocationConfiguration: {
        crlConfiguration: {
            expirationInDays: 300,
            customCname: "pulumice",
            
        },
    },
    permanentDeletionTimeInDays:7,

});
*/


const mycert = new aws.acm.Certificate("shaht-cert", {
    privateKey: my_privatekey,
    certificateChain: my_certpem,
    certificateBody: my_certpem,
    domainName: "shahtexample.com",
    //certificateAuthorityArn: my_certrequest_pem,
    validationMethod: "DNS",
});


/*const cert = new aws.acm.Certificate("cert", {
    privateKey: my_privatekey,
    certificateBody: my_certpem,
    certificateAuthorityArn: exampleCertificateAuthority.id,
});

export const certificateauthority_arn = exampleCertificateAuthority.arn;
export const certificateauthority_status = exampleCertificateAuthority.status
*/

/////////

/* const exampleSelfSignedCert = new tls.SelfSignedCert("shaht-exampleSelfSignedCert", {
    keyAlgorithm: "RSA",
    privateKeyPem: my_private_key,
    subjects: [{
        commonName: "example.com",
        organization: "ACME Examples, Inc",
        country: "USA"
    }],
    validityPeriodHours: 1,
    allowedUses: [
        "key_encipherment",
        "digital_signature",
        "server_auth",
    ],
}); */

// aws acm-pca issue-certificate --certificate-authority-arn Private-CA-ARN --csr file://client-cert-sign-request --signing-algorithm "SHA256WITHRSA" --validity Value=300,Type="DAYS"

/* const mycertificateauthority = new aws.acmpca.CertificateAuthority("shaht-certauthority", {
    certificateAuthorityConfiguration: {
        keyAlgorithm: "RSA_4096",
        signingAlgorithm: "SHA256WITHRSA",
        subject: {
            commonName: "example.com",
            
        },
    },
    permanentDeletionTimeInDays: 7,
    revocationConfiguration: {
        crlConfiguration: {
            expirationInDays: 300

        }, 
    },
}); */

/* export const certRequest_urn = certRequest.urn;
export const certRequest_id = certRequest.id;
export const certRequest_subjects = certRequest.subjects;
export const certRequest_certRequestPem = certRequest.certRequestPem; */
//export const mycert_cert_arn = mycert.arn;
//export const mycert_cert_domainName = mycert.domainName;

/* export const mycertificateauthority_arn = mycertificateauthority.arn;
export const mycertificateauthority_revocationConfiguration = mycertificateauthority.revocationConfiguration;
export const mycertificateauthority_type = mycertificateauthority.type;
export const mycertificateauthority_status = mycertificateauthority.status;
 */


