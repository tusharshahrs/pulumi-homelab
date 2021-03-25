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

// Used for sshPrivateKey and mykeypair
const myname = "shaht-instance";

// creating the private key for the keypair
export const sshPrivateKey = new tls.PrivateKey(`${myname}-privatekey`, {
    algorithm: "RSA",
    rsaBits: 4096,
});

// creating the keypair
const mykeypair = new aws.ec2.KeyPair(`${myname}-keypair`, {
    publicKey: sshPrivateKey.publicKeyOpenssh,
    keyName: `${myname}`,
});

// Get the AWS Linux2 AMI
const amiId = aws.getAmi({
    owners: ["amazon"],
    mostRecent: true,
    filters: [{
        name: "name",
        values: ["amzn2-ami-hvm-2.0.????????-x86_64-gp2"],
    }],
}, { async: true }).then(ami => ami.id);

const name = "shaht-ks-knode"
const size = "t3a.micro";

const requiredMachines = 2;
const ebsvolumeSize = 15;
const ebsvolumetype = "gp2";

// Creates a private zone
const privatezone = new aws.route53.Zone("private_zone", {
  vpcs: [
    {
      vpcId: vpc_id,
    },
  ],
  comment: "Internal name resolution of tusharshah.com",
  forceDestroy: true,
  name: "tusharshah.com",
  tags: { "Billing": "mydevops","pulumi":"yes", "typescript":"yes","gui":"no","private":"yes"}
});

for (let i = 1; i < requiredMachines + 1; i++) {

    const myinstance = new aws.ec2.Instance(`${name}-${i}`, {
      ami: amiId,
      instanceType: size,
      subnetId: subnetaz1,
      
      keyName: mykeypair.keyName,
      tags: {
        Name: `${name}-server-${i}`,
        Environment: "DEV",
        "pulumi:Project": projectName,
        "pulumi:Stack": stackName,
      },
      rootBlockDevice: {
        encrypted: true,
        deleteOnTermination: true,
        volumeSize: 10,
        volumeType: "gp2",
        tags: {
          Name: `${name}-server-${i}-rootblock`
        }
      },
      ebsBlockDevices:[{
        deviceName: "/dev/sda1",
        volumeSize: ebsvolumeSize,
        encrypted: true,
        deleteOnTermination: true,  // In the prod/qa this needs to be changed to: false
        volumeType: ebsvolumetype,
        tags: {
            Name: `${name}-server-${i}-/dev/sda1`,
            Environment: "DEV",
            "pulumi:Project": projectName,
            "pulumi:Stack": stackName,
          },
        }],
    });

  // Creating an A Record in route53
  const instanceDNSRecord = new aws.route53.Record(`DNS A record for ${name}-${i}`, {
      zoneId: privatezone.id,
      name: pulumi.interpolate`${name}-${i}.${privatezone.name}`,
      type: "A",
      ttl: 300,
      records: [myinstance.privateIp]
  });
}