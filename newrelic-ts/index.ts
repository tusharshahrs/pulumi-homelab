import * as pulumi from "@pulumi/pulumi";
import * as newrelic from "@pulumi/newrelic";

const myname = "demo";
const oneDashBoardPage = new newrelic.OneDashboard(`${myname}-onedashboard`, {
    name: pulumi.interpolate`${myname}-sample dashboard`,
    description: "Sample New Relic Dashboard created via pulumi",
    permissions: "public_read_only",
    pages: [
                {
                name: "mypage_1", 
                description: "This is mypage_1",
                // The widgetMarkdowns is required
                widgetMarkdowns: [{title: "Dashboard Note", row: 1, column: 9, text: "### Helpful Links\n\n* [New Relic One](https://one.newrelic.com)\n* [Developer Portal](https://developer.newrelic.com)"}],
                // The widgetBillBoards below is optional
                //widgetBillboards: [{title: "Requests per minute", row: 1, column: 1, nrqlQueries:[]}],
                // The widgetBars below is optional
                //widgetBars: [{title:"Average transaction duration, by application", row:1, column:5, nrqlQueries: []}],
                }
                
            ],
})