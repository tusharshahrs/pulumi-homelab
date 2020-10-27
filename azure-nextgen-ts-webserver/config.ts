import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

const config = new pulumi.Config();

export const projectName = pulumi.getProject()
export const stackName = pulumi.getStack()

export const sshKey = new tls.PrivateKey(`${projectName}-sshkey`, 
    {
        algorithm: "RSA",
    });