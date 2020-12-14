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
exports.createStorageClass = void 0;
const k8s = require("@pulumi/kubernetes");
const pulumi = require("@pulumi/pulumi");
/**
 * Creates a single Kubernetes StorageClass from the given inputs.
 */
function createStorageClass(name, storageClass, opts) {
    // Compute the storage class's metadata, including its name and default storage class annotation.
    const metadata = pulumi.all([storageClass.metadata || {}, storageClass.default])
        .apply(([m, isDefault]) => {
        if (isDefault) {
            m.annotations = Object.assign(Object.assign({}, m.annotations || {}), { "storageclass.kubernetes.io/is-default-class": "true" });
        }
        return m;
    });
    // Figure out the parameters for the storage class.
    const parameters = {
        "type": storageClass.type,
    };
    if (storageClass.zones) {
        parameters["zones"] = pulumi.output(storageClass.zones).apply(v => v.join(", "));
    }
    if (storageClass.iopsPerGb) {
        parameters["iopsPerGb"] = pulumi.output(storageClass.iopsPerGb).apply(v => `${v}`);
    }
    if (storageClass.encrypted) {
        parameters["encrypted"] = pulumi.output(storageClass.encrypted).apply(v => `${v}`);
    }
    if (storageClass.kmsKeyId) {
        parameters["kmsKeyId"] = storageClass.kmsKeyId;
    }
    return new k8s.storage.v1.StorageClass(name, {
        metadata: metadata,
        provisioner: "kubernetes.io/aws-ebs",
        parameters: parameters,
        allowVolumeExpansion: storageClass.allowVolumeExpansion,
        mountOptions: storageClass.mountOptions,
        reclaimPolicy: storageClass.reclaimPolicy,
        volumeBindingMode: storageClass.volumeBindingMode,
    }, opts);
}
exports.createStorageClass = createStorageClass;
//# sourceMappingURL=storageclass.js.map