import * as tls from "@pulumi/tls";

// Create an SSH public key that will be used by the Kubernetes cluster.
// Note: We create one here to simplify the demo, but a production deployment would probably pass
// an existing key in as a variable.
const sshPublicKey = new tls.PrivateKey("shahtkey", {
    algorithm: "RSA",
    rsaBits: 4096,
});

export const mysshkey_id = sshPublicKey.id;
export const mysshkey_algorithm = sshPublicKey.algorithm;
export const mysshkey_privateKeyPem = sshPublicKey.privateKeyPem;
export const mysshkey_publicKeyFingerprintMd5 = sshPublicKey.publicKeyFingerprintMd5;
export const mysshkey_PublicKeyOpenssh = sshPublicKey.publicKeyOpenssh;
