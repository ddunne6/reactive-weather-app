const express = require('express');
const https = require('https');
const app = express();
const port = 8000;
const path=require("path");
const bodyparser = require('body-parser');
const { maxHeaderSize } = require('http');
let publicPath= path.resolve(__dirname,"public");

app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json()) 

app.use(express.static(publicPath));
app.get('/city/:city_name', sendweather);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function sendweather(req, res) {
    var sumtemps = 0;   //sum of temperatures

    let obj = {         //object that will be sent back to client
        day : [
        ],
        rain : false,
        error : null,
        country : null,
        city : req.params.city_name,
        climate : null
    }

    console.log('Received a city called ' + obj.city);

    //Do a get on the city
    const appId = "25d5c2df96f7a21942332e57977fe8fb";
    const url = "https://api.openweathermap.org/data/2.5/forecast?q=" + obj.city + "&appid=" + appId + "&units=metric";
    
    let prom = new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.on("data", (data) => {
                    const wData = JSON.parse(data);
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
        var n = 0; //counts number of days, should be 5
        for (var i=0 ; i < wData.list.length ; i++) {
            var dt = new Date(wData.list[i].dt_txt);
            var hr = dt.getUTCHours();
            var day = dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear();
            if (hr == 12) { //getting data for 12 noon
                //checking if it rains for this day at 12 noon
                if (wData.list[i]["weather"][0]["main"] == "Rain") {
                    obj.rain = true;
                    rainf = wData.list[i].rain["3h"];
                }
                else {
                    rainf = 0;
                }
                obj["day"].push({temperature : wData.list[i].main.temp, dates : day, windspeed : wData.list[i].wind.speed, rainfall : rainf});
                sumtemps = sumtemps + wData.list[i].main.temp;
                n = n + 1;
            }
        }

        //calculate average temperature and then assign cold, warm or hot
        var avgtemp = sumtemps / n;
        if(avgtemp <= 10) {
            obj.climate = "cold";
        }
        else if (avgtemp > 10 && avgtemp <= 20) {
            obj.climate = "warm";
        }
        else {
            obj.climate = "hot";
        }
        return 1;
    }).then(nul => {
        //console.log(obj);
        res.json(obj);
        console.log("Sent the resulting object to client!");
    })
}