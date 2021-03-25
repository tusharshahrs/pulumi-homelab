import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { Config, getStack, StackReference,getProject } from "@pulumi/pulumi";

const config = new pulumi.Config();
export const eksStack = new StackReference(config.require("eksclusterStack"));
export const eks_cluster_name = eksStack.getOutput("eks_cluster_name");
export const kubeconfig = eksStack.getOutput("kubeconfig");
export const k8sProvider = eksStack.getProvider("k8sProvider");
export const projectName = pulumi.getProject();
export const stackName = pulumi.getStack();

const config2 = new pulumi.Config("aws");
export const region = config2.get("region");

const config3 = new pulumi.Config();
const networkingStack = new StackReference(config3.require("networkingStack"));
export const vpc_id = networkingStack.getOutput("pulumi_vpc_id");