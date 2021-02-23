import * as pulumi from "@pulumi/pulumi";
import * as newrelic from "@pulumi/newrelic";
import { accountId } from "@pulumi/newrelic/config";

const config = new pulumi.Config();
//const new_relic_account = config.requireSecretNumber("newrelic:accountId")

//const my_account = replaceme;
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
                widgetBillboards: [{title: "Requests per minute", row: 1, column: 1, nrqlQueries:[]}],
                // The widgetBars below is optional
                widgetBars: [{title:"Average transaction duration, by application", row:1, column:5, nrqlQueries: []}],
                //
                //widgetLines: [{title:"Average Response Time",row: 1, column: 1, nrqlQueries: [{accountId: Number(my_account), query: `SELECT average(duration * 1000) AS 'Response time' FROM Transaction TIMESERIES SINCE 1800 seconds ago EXTRAPOLATE` }]}],
                }
            ],
})