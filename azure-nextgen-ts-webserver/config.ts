import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

const config = new pulumi.Config();

export const projectName = pulumi.getProject()
export const stackName = pulumi.getStack()
export const location = config.get("location") || "westus";
export const nameprefix = config.get("nameprefix") || projectName;

export const sshKey = new tls.PrivateKey(`${projectName}-sshkey`, 
    {
        algorithm: "RSA",
    });