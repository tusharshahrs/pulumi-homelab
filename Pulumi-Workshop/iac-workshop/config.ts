import { Config } from "@pulumi/pulumi";

const config = new Config();
export const siteDir = config.require("siteDir");