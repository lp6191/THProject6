var fs = require('fs');
var Crawler = require("simplecrawler");
var csv = require('fast-csv');
var moment = require('moment');
var stream = require('stream');


var dir = "./data";

//create folder if it doesn't already exist.
if(!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

//variables used in the program.
var data = ["Title", "Price", "ImageURL", "URL", "Time", "\n"];
var buffered_data = "";
var date = moment().format('YYYY-MM-DD');
var price = "";
var title = "";
var url = "";
var img_url = "";
var time = 0;
var price_search = 0;
var heading = "";

//initialize the scraper and configure it.
var crawler = new Crawler("http://shirts4mike.com/shirts.php");
crawler.interval = 1000; // 1 second
crawler.maxDepth = 2;
crawler.maxResourceSize = 3000;

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {

    console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
    console.log("It was a resource of type %s", response.headers['content-type']);
    
    //transform the data in to strin.
    buffered_data = responseBuffer.toString();
    
    //search the data for the symbol that indicates we're on the right page.
    price_search = buffered_data.indexOf("$");
    //console.log(price_search);

    if(price_search > -1 && buffered_data.length > 1000){
      heading = buffered_data.substring(buffered_data.lastIndexOf("<h1>"), buffered_data.lastIndexOf("</h1>"));
      price = heading.substring(heading.indexOf("$"), (heading.indexOf("$") + 3));
      title = heading.substring(heading.indexOf("</span>") + 8, heading.length);
      url = queueItem.url;
      time = moment().format('MMMM DD YYYY, h:mm:ss a');
      img_url = "http://www.shirts4mike.com/img/shirts/" + buffered_data.substring(buffered_data.indexOf("<img ") + 21, buffered_data.indexOf("<img ") + 34);
      
      //add acquired data to an array
      data.push(title, price, img_url, url, time, "\n");
      
      //helpful console logs, that were used in the process.
      
      /*console.log(output);
      console.log(title);
      console.log(price);
      console.log(img_url);
      console.log(url);*/
    }
    
    //console.log(buffered_data);
});

//when the scraping is complete and if there's any returned data, write it to file.
crawler.on("complete", function(){
  if(data.length > 0){
    csv.writeToPath("./data/" + date + ".csv", [data], {headers: true}).on("finish", function(){
      console.log("done writing to file!");
    });
  }
});

//display the error message, when ther's no internet connection.
crawler.on("fetchclienterror", function(queueItem, error){
  console.log("There’s been a " + error + " error. Cannot connect to the to http://shirts4mike.com. Please check your internet connection.");
});

crawler.start();
