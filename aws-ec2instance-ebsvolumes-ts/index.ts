import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Config, getStack, getProject, StackReference } from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

const config = new pulumi.Config();
const networkingStack = new StackReference(config.require("networkingStack"));
const vpc_id = networkingStack.getOutput("pulumi_vpc_id");
const vpc_privatesubnetids = networkingStack.getOutput("pulumi_vpc_private_subnet_ids");
const vpc_publicsubnetids = networkingStack.getOutput("pulumi_vpc_public_subnet_ids");
const subnetaz1 = vpc_publicsubnetids.apply(vpc_publicsubnetids => vpc_publicsubnetids[0]);
const projectName = getProject();
const stackName = getStack();

const myname = "shaht-instance";

export const sshPrivateKey = new tls.PrivateKey(`${myname}-privatekey`, {
    algorithm: "RSA",
    rsaBits: 4096,
});

const mykeypair = new aws.ec2.KeyPair(`${myname}-keypair`, {
    publicKey: sshPrivateKey.publicKeyOpenssh,
    keyName: `${myname}`,
});

// Get the AMI
const amiId = aws.getAmi({
    owners: ["amazon"],
    mostRecent: true,
    filters: [{
        name: "name",
        values: ["amzn2-ami-hvm-2.0.????????-x86_64-gp2"],
    }],
}, { async: true }).then(ami => ami.id);

const name = "shaht"
const size = "t3a.micro";


const myinstance = new aws.ec2.Instance(`${name}-server`, {
  ami: amiId,
  instanceType: size,
  subnetId: subnetaz1,
  disableApiTermination: false,
  rootBlockDevice: {encrypted: true},
  ebsBlockDevices: [
    {
      deviceName: "xvdd",
      volumeSize: 10,
      encrypted: true,
      tags: {"Name": "tushartest-xvdd", "mysize":"10"}
    },
    {
      deviceName: "xvde",
      volumeSize: 15,
      encrypted: true,
      tags: {"Name": "tushartest-xvde", "size": "15"}
    },
    /*{
      deviceName: "xvdf",
      volumeSize: 25,
      encrypted: true,
    },
    {
      deviceName: "xvdg",
      volumeSize: 30,
      encrypted: true,
    },*/
  ],
});

export const keypair_name = mykeypair.keyName; // same as export const keypair_id = mykeypair.id;
export const keypair_arn = mykeypair.arn;
export const keypair_finger = mykeypair.fingerprint;
export const keypair_publicKey = mykeypair.publicKey;