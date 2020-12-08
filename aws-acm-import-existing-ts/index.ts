import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";

const sshPublicKey = new tls.PrivateKey("shahtkeyprivatekey", {
    algorithm: "RSA",
    rsaBits: 4096,
});

const exampleSelfSignedCert = new tls.SelfSignedCert("shahtexampleSelfSignedCert", {
    keyAlgorithm: "RSA",
    privateKeyPem: sshPublicKey.privateKeyPem,
    subjects: [{
        commonName: "shahtexample.com",
        organization: "shaht ACME Examples, Inc",
        organizationalUnit: "engineering",
        locality: "Seattle",
        country: "USA",
        
    }],
    validityPeriodHours: 7224,
    allowedUses: [
        "key_encipherment",
        "digital_signature",
        "server_auth",
    ],
    earlyRenewalHours: 24,
});

const cert = new aws.acm.Certificate("shahtcert", {
    privateKey: sshPublicKey.privateKeyPem,
    certificateBody: exampleSelfSignedCert.certPem,
    //validationMethod: "DNS",
});


export const sshkey_id = sshPublicKey.id;
export const sshkey_algorithm = sshPublicKey.algorithm;
export const sshkey_publickeyfingerprintmd5 = sshPublicKey.publicKeyFingerprintMd5;
export const sshkey_publickeyopenssh = sshPublicKey.publicKeyOpenssh;

export const exampleSelfSignedCert_id = exampleSelfSignedCert.id;
export const exampleSelfSignedCert_algo = exampleSelfSignedCert.keyAlgorithm;
export const exampleSelfSignedCert_subjects = exampleSelfSignedCert.subjects;
export const exampleSelfSignedCert_validityperiod = exampleSelfSignedCert.validityEndTime;

export const cert_arn = cert.arn;
export const cert_status = cert.status;