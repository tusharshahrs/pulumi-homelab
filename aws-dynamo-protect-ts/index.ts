import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myname = "shaht";

/*const kms_iam_policy = new aws.iam.Policy(`${myname}-kms-policy`, {
  description: "shaht kms policy",
  path: "/",
  policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "kms:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
`,
});
*/

const kms_examplePolicyDocument = aws.iam.getPolicyDocument({
  statements: [
    {
      sid: "Enable IAM User Permissions",
      actions: ["kms:*"],
      effect: "Allow",
      resources: ["*"],
      principals: [
        {
          type: "AWS",
          identifiers: ["arn:aws:iam::052848974346:root"],
          //type: "Service",
          //identifiers: ["kms.amazonaws.com"],
        },
      ],
    },
    {
      sid: "Enable KMS Services Permission",
      actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
      effect: "Allow",
      resources: ["*"],
      principals: [
        {
          identifiers: ["kms.amazonaws.com"],
          type: "Service",
        },
      ],
    },
  ],
});


const kms_key = new aws.kms.Key(`${myname}-kms-key`, {
  deletionWindowInDays: 7,
  description: "shaht kms key for testing1",
  enableKeyRotation: true,
  policy: kms_examplePolicyDocument.then(
    (kms_examplePolicyDocument) => kms_examplePolicyDocument.json
  ),
});

const kms_key2 = new aws.kms.Key(`${myname}-kms2-key2`, {
    deletionWindowInDays: 7,
    description: "shaht2 kms2 key2 for testing2",
    enableKeyRotation: true,
    policy: kms_examplePolicyDocument.then(
      (kms_examplePolicyDocument) => kms_examplePolicyDocument.json
    ),
  });

const kms_alias = new aws.kms.Alias(`${myname}-kms-alias`, {
  name: `alias/${myname}kms`,
  targetKeyId: kms_key.keyId,
});

const kms_alias2 = new aws.kms.Alias(`${myname}-kms2-alias2`, {
    name: `alias/${myname}kms2`,
    targetKeyId: kms_key2.keyId,
  });

const basic_dynamodb_table = new aws.dynamodb.Table(
  `${myname}-dynamodb-table`,
  {
    attributes: [
      {
        name: "UserId",
        type: "S",
      },
      {
        name: "GameTitle",
        type: "S",
      },
      {
        name: "TopScore",
        type: "N",
      },
    ],
    //serverSideEncryption: { enabled: true, kmsKeyArn: kms_alias.arn  },
    serverSideEncryption: { enabled: true, kmsKeyArn: kms_alias2.arn  },
    billingMode: "PROVISIONED",
    globalSecondaryIndexes: [
      {
        hashKey: "GameTitle",
        name: "GameTitleIndex",
        nonKeyAttributes: ["UserId"],
        projectionType: "INCLUDE",
        rangeKey: "TopScore",
        readCapacity: 1,
        writeCapacity: 1,
      },
    ],
    hashKey: "UserId",
    rangeKey: "GameTitle",
    readCapacity: 5,
    tags: {
      Environment: "production",
      Name: "dynamodb-table-1",
    },
    //ttl: {
    //    attributeName: "TimeToExist",
    //    enabled: false,
    //},
    pointInTimeRecovery: { enabled: false },

    writeCapacity: 5,
  },
  { protect: true }
);

export const kms_key_arn = kms_key.arn;
export const kms_key_id = kms_key.id;
export const kms_alias_arn = kms_alias.arn;
export const kms_alias_name = kms_alias.name;
export const dynamodb_name = basic_dynamodb_table.name;
export const dynamodb_arn = basic_dynamodb_table.arn;
export const dynamodb_writeCapacity = basic_dynamodb_table.writeCapacity;
export const dynamodb_readCapacity = basic_dynamodb_table.readCapacity;