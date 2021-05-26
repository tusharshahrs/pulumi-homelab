import * as tls from "@pulumi/tls";
import * as pulumi from "@pulumi/pulumi";

// Create an SSH public key that will be used by the Kubernetes cluster.
// Note: We create one here to simplify the demo, but a production deployment would probably pass
// an existing key in as a variable.
const name = "demo";

const sshPublicKey = new tls.PrivateKey(`${name}-key-privatekey`, {
    algorithm: "RSA",
    rsaBits: 4096,
});

const certRequest = new tls.CertRequest(`${name}-key-certrequest`, {
    privateKeyPem: sshPublicKey.privateKeyPem,
    keyAlgorithm: "RSA",
    subjects: [{ commonName: `${name}cert`,organization: "pulumi"}],
});

export const sshkey_id = sshPublicKey.id;
export const sshkey_algorithm = sshPublicKey.algorithm;

export const sshkey_publickeyfingerprintmd5 = sshPublicKey.publicKeyFingerprintMd5;
export const sshkey_publickeyopenssh = sshPublicKey.publicKeyOpenssh;
export const certrequest_id = certRequest.id;
export const certrequest_keyalgorithm = certRequest.keyAlgorithm;
export const certrequest_subjects = certRequest.subjects;

export const sshkey_privatekeypem = pulumi.secret(sshPublicKey.privateKeyPem);
export const certrequest_pem = pulumi.secret(certRequest.certRequestPem);