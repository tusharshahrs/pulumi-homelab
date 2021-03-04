import * as pulumi from "@pulumi/pulumi";
import * as azuread from "@pulumi/azuread";


const group = new azuread.Group("my-group", {
    description: "This is Tushar Shah's test group",
});

export const group_description = group.description;
export const group_name = group.name;
export const group_urn = group.urn;