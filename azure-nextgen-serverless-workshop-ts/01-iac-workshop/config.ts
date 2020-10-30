import { Config, getProject, getStack } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

const config = new Config();
export const containerName = config.require("container");
export const mylocation = config.require("location");
export const myname = config.require("name");
export const projectName = pulumi.getProject();
export const stackName = pulumi.getStack();