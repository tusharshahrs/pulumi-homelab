import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";

const examplePrivateKey = new tls.PrivateKey("demo-examplePrivateKey", {algorithm: "RSA"});

const exampleSelfSignedCert = new tls.SelfSignedCert("demo-exampleSelfSignedCert", {
    keyAlgorithm: "RSA",
    privateKeyPem: examplePrivateKey.privateKeyPem,
    subjects: [{
        commonName: "demoexample.acme.com",
        organization: "ACME Examples, Inc",
        country: "USA"
    }],
    validityPeriodHours: 1,
    allowedUses: [
        "key_encipherment",
        "digital_signature",
        "server_auth",
    ],
});

const cert = new aws.acm.Certificate("demo-cert", {
    privateKey: examplePrivateKey.privateKeyPem,
    certificateBody: exampleSelfSignedCert.certPem,
});

export const cert_id = cert.id;
export const cert_status = cert.status;
export const cert_domainName = cert.domainName;
export const cert_validationmethod = cert.validationMethod;