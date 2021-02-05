import * as pulumi from "@pulumi/pulumi";
import * as newrelic from "@pulumi/newrelic";

const myname = "page1";
const oneDashBoardPage = new newrelic.OneDashboard(`${myname}-onedashboard`, {
    //name: myname,
    name: "shaht sample dashboard",
    description: "shaht sample new relic dashboard",
    permissions: "public_read_only",
    pages: [{name: "mypages1", description: "shaht mypages1"}],
})