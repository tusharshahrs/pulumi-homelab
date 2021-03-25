import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.ebs.Volume("shaht-example-volume", {
    availabilityZone: "us-east-2a",
    size: 10,
    tags: {
        Name: "HelloWorld",
    },
});

const mysize = 2;
for (let i = 0; i < mysize; i++)
{   
    let dateTime = new Date()
    const exampleSnapshot = new aws.ebs.Snapshot(`exampleSnapshot-${i}`, {
    volumeId: example.id,
    tags: {
        Name: `HelloWorld_snap_${i}`,
        Date: `${dateTime}`,
    },
    });
}