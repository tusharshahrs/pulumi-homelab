import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const mydemouserprofile = new aws.iam.UserLoginProfile("UserLoginProfile", {
    // The user: matches what is in the aws console. 
    user: "demotest-forimport",
    // The pgpKey is a made up value.  As you can see here, it will be ignored.
    pgpKey: "keybase:demotest-forimport",
}, {import: "demotest-forimport"});
//}, {import: "demotest-forimport", ignoreChanges: ["pgpKey"]});