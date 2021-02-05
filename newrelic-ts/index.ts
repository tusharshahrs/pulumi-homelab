import * as pulumi from "@pulumi/pulumi";
import * as newrelic from "@pulumi/newrelic";
import * as random from "@pulumi/random";
import { OneDashboard } from "@pulumi/newrelic";
import { title } from "process";
import { accountId } from "@pulumi/newrelic/config";

// Creates a random password for wordpressPassword
const myrandom = new random.RandomString("wordpresspassword", {
    length: 5,
    special: false,
    upper: true,
    lower: true,
    number: true,
},);

const myname = "page";
const myguid = pulumi.interpolate`${myname}-${myrandom.result}`;

//const widget_bar = new newrelic.W
const oneDashBoardPage = new newrelic.OneDashboard(`${myname}-onedashboard`, {
    //name: myname,
    name: "shaht sample dashboard",
    description: "shaht sample new relic dashboard",
    permissions: "public_read_only",
    
    pages: [
                {
                name: "mypages1", 
                description: "shaht mypages1",
                widgetMarkdowns: [{title: "Dashboard Note", row: 1, column: 9, text: "### Helpful Links\n\n* [New Relic One](https://one.newrelic.com)\n* [Developer Portal](https://developer.newrelic.com)"}],
                //widgetBillboards: [{title: "Requests per minute", row: 1, column: 9, nrqlQueries: ["FROM Transaction SELECT rate(count(*), 1 minute)"]}],
                //widgetBars: [{title:"Average transaction duration, by application", row:1, column:5, nrqlQueries: ["FROM transaction SELECT average(duration) FACET appName"]}],
                }
                
            ],
})