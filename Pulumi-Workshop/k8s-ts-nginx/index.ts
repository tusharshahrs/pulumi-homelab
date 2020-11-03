import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

import { eksStack, cluster,kubeconfig,k8sProvider,} from "./common";
/* const config = new pulumi.Config();
const eksStack = new StackReference(config.require("eksclusterStack"));
const cluster = eksStack.getOutput("eks_cluster_name");
const kubeconfig = pulumi.secret(eksStack.getOutput("kubeconfig"));
const k8sProvider = eksStack.getOutput("k8sProvider");
const myproject = getProject(); */
//const myproject = projectName;
const projectName = pulumi.getProject();
const stackName = pulumi.getStack();

const namespace = new k8s.core.v1.Namespace(projectName, {
    metadata:
    {
        name: projectName,
    }
}, { provider: k8sProvider });
export const namespaceName = namespace.metadata.name;
