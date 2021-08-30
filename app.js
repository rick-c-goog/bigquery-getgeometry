const http = require('http');
const express = require('express');
var url = require('url');
const { emitWarning } = require('process');
//var app = express();
const hostname = '127.0.0.1';
const port = 3000;
//app.get('/',function(req,res) {
//  console.log("root call received:");
//  res.end("please use /boundary /stations");
//});
var app=http.createServer(function(req,res) {
  //res.setHeader('Content-Type', 'text/plain');
  var queryData = url.parse(req.url, true).query;
  //console.log("boundary call received:");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Content-Type', 'application/json');
  var queryString="";
  
  if(queryData.name=='boundary') {
    console.log("Retrive:"+ queryData.name);
    queryString= `SELECT borough_code as id, ST_ASGEOJSON(borough_geom) as geom
      FROM \`bigquery-public-data.new_york_subway.geo_nyc_borough_boundaries\``;
    query(queryString).then(rows => { 
        console.log("number of records:"+rows.length); 
         
         var JSONString=JSON.stringify(rows,null, ' '); 
         //res.end(JSONString);
         
         res.end(JSONString);
         //res.json(jsonObj);
    });
        
  }else if(queryData.name=='stations') {
    console.log("Retrive:"+ queryData.name);
    queryString= `SELECT station_id as id, ST_ASGEOJSON(station_geom) as geom
    FROM \`bigquery-public-data.new_york_subway.stations\``;
    query(queryString).then(rows => { 
      console.log("number of records:"+rows.length); 
       
       var JSONString=JSON.stringify(rows,null, ' '); 
       //res.end(JSONString);
       
       res.end(JSONString);
       //res.json(jsonObj);
    });

   }else {
    res.end("wrong type");
   }
  
  });

// Setting the server to listen at port 3000
app.listen(3000, function(req, res) {
    console.log("Server is running at port http://"+hostname+":"+port);
  });


const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
  // [END bigquery_client_default_credentials]
async function query(queryString) {
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
      query: queryString,
      // Location must match that of the dataset(s) referenced in the query.
      //location: 'US',
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    //console.log('Rows:');
    var tableData=[];
    rows.forEach(row => {
        tableData.push(
             {"id": `${row.id}`, "geom": `${row.geom}`});
            });
    //tableData.forEach(rs => console.log(rs));
    return tableData;
  }