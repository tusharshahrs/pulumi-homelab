"use strict";
// Copyright 2016-2019, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRole = void 0;
const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const crypto = require("crypto");
// sha1hash returns a partial SHA1 hash of the input string.
function sha1hash(s) {
    const shasum = crypto.createHash("sha1");
    shasum.update(s);
    // Limit the size of hashes to ensure we generate shorter/ resource names.
    return shasum.digest("hex").substring(0, 8);
}
/**
 * The ServiceRole component creates an IAM role for a particular service and attaches to it a list of well-known
 * managed policies.
 */
class ServiceRole extends pulumi.ComponentResource {
    /**
     * Create a new ServiceRole.
     *
     * @param name The _unique_ name of this component.
     * @param args The arguments for this cluster.
     * @param opts A bag of options that control this component's behavior.
     */
    constructor(name, args, opts) {
        super("eks:index:ServiceRole", name, args, opts);
        const assumeRolePolicy = pulumi.output(args.service).apply(service => JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                    Action: [
                        "sts:AssumeRole",
                    ],
                    Effect: "Allow",
                    Principal: {
                        Service: [service],
                    },
                }],
        }));
        const role = new aws.iam.Role(`${name}-role`, {
            description: args.description,
            assumeRolePolicy: assumeRolePolicy,
        }, { parent: this });
        const rolePolicyAttachments = [];
        for (const policy of (args.managedPolicyArns || [])) {
            rolePolicyAttachments.push(new aws.iam.RolePolicyAttachment(`${name}-${sha1hash(policy)}`, {
                policyArn: policy,
                role: role,
            }, { parent: this }));
        }
        this.role = pulumi.all([role.arn, ...rolePolicyAttachments.map(r => r.id)]).apply(() => role);
        this.registerOutputs({ role: this.role });
    }
}
exports.ServiceRole = ServiceRole;
//# sourceMappingURL=servicerole.js.map