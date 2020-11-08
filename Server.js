const express = require('express');
const https = require('https');
const app = express();
const port = 8000;
const path=require("path");
const bodyparser = require('body-parser');
const { maxHeaderSize } = require('http');
let publicPath= path.resolve(__dirname,"public");

// Body-parser middleware 
app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json()) 

app.use(express.static(publicPath));
app.get('/city/:city_name', sendweather);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function sendweather(req, res) {
    //let city = req.params.city_name;
    // let country = null;
    // let temperature = [];
    //let dates = [];
    //let windspeed = [];
    //let rainfall = [];

    //creating an object

    var sumtemps = 0;

    let obj = {
        day : [
        ],
        rain : false,
        error : null,
        country : null,
        city : req.params.city_name,
        climate : null
    }
    console.log(obj);

    console.log('Received a city called ' + obj.city);

    //Do a get on the city
    const appId = "25d5c2df96f7a21942332e57977fe8fb";
    const url = "https://api.openweathermap.org/data/2.5/forecast?q=" + obj.city + "&appid=" + appId + "&units=metric";
    
    let prom = new Promise((resolve, reject) => {
        https.get(url, (response) => {
            console.log("Doing a get on " + obj.city);
            if (response.statusCode === 200) {
                console.log("City found on system!"); 
                response.on("data", (data) => {
                    const wData = JSON.parse(data);
                    //console.log(wData);
                    resolve(wData);
                })
            } 
            else {
                res.status(400);
                res.json( {error : "Bad Request."});
                return;
            }
        })
    })

    

    prom.then((wData) => {
    //parser data
        obj.country = wData.city.country;
        var n = 0
        //console.log(wData.city.country);
        for (var i=0 ; i < wData.list.length ; i++) {
            //console.log("i = ", i);
            //console.log(wData.list[i]["weather"][0]["main"]);
            console.log(wData.list[i].dt_txt);
            var dt = new Date(wData.list[i].dt_txt);
            var hr = dt.getUTCHours();
            var day = dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear();
            console.log(hr);
            if (hr == 12) { //getting data for 12 noon
                //checking if it rains for this day at 12 noon
                if (wData.list[i]["weather"][0]["main"] == "Rain") {
                    //console.log(wData.list[i].dt);
                    obj.rain = true;
                    rainf = wData.list[i].rain["3h"];
                }
                else {
                    rainf = 0;
                }
                //store temperature info
                //dates.push(wData.list[i].dt_txt);
                //temperature.push(wData.list[i].main.temp);
                //windspeed.push(wData.list[i].wind.speed);
                obj["day"].push({temperature : wData.list[i].main.temp, dates : day, windspeed : wData.list[i].wind.speed, rainfall : rainf});
                sumtemps = sumtemps + wData.list[i].main.temp;
                n = n + 1;
            }
        }
        var avgtemp = sumtemps / n;
        //console.log(avgtemp);
        //if(avgte)
        return 1;
        //res.JSON( {result : 5} );
    }).then(nul => {
        //console.log("rain = ", rain);
        console.log("promise.then.then");
        // res.json( { rain : rain, city : city, country : country, dates : dates, temperature : temperature, windspeed : windspeed, rainfall : rainfall } );
        console.log(obj);
        console.log("message sent!");
        res.json(obj);
    })
}