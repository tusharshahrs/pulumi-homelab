import * as pulumi from "@pulumi/pulumi";

// https://github.com/googleapis/nodejs-bigtable#installing-the-client-library
// If bigtable instance exists https://github.com/googleapis/nodejs-bigtable/blob/master/samples/instances.js
// if bigtable table exists https://github.com/googleapis/nodejs-bigtable/blob/master/samples/tableadmin.js
// fyi: We had to grant bigtable admin access for this to work via the console.

// Imports the Google Cloud client library
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();

async function quickstart() {
  // Connect to an existing instance:my-bigtable-instance
  console.log();
  console.log('Connecting to current BigTablein current project...');
  const bigtable_instance="gcp-ref-py-demo-bigtb-c019fda";
  const bigtable_instance_table="gcp-ref-py-demo-table-b53c3e4";
  //const bigtable_instance="gcp-ref-py-demo-bigtb";
  const instance = bigtable.instance(bigtable_instance);
  console.log('Check Instance Exists');
  // [START bigtable_check_instance_exists]
  const [instanceExists] = await instance.exists(); 

  // instance if does not exists
  if (!instanceExists) {
      console.log(`BIGTABLE ${bigtable_instance} does NOT Exist`)
  }
  else {
      console.log(`Instance ${instance.id} exists`);
  }

  console.log();
  console.log('Listing tables in current project...');
  // Connect to an existing table:my-table
  const table = instance.table(bigtable_instance_table);
  const [tableExists] = await table.exists();
  if (!tableExists) {
    // Create table if does not exist
    console.log(`Table ${bigtable_instance_table} does NOT exist`)
  } else {
      console.log(`Table ${table.id} exists`);
  }
  
}
quickstart();