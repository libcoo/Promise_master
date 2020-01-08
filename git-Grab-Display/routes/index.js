//Definitions of dependencies
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const URL = 'http://localhost:8080';

/**
 * Function fetching data from API
 * @param URL - URL to the API endpoint
 * @returns {Promise<{data: *}>} returns a promise with data gotten from API
 */
const fetchData = async (URL) => {
        const api_call = await fetch(URL);
        const data = await api_call.json();
        return {data};
    };
/**
 * Function fetching data from API
 * @param URL - URL to the API endpoint
 * @returns {Promise<{data: *}>} returns a promise with data gotten from API
 */
const fetchPredictions = async (URL) => {
    const api_call = await fetch(URL);
    const data =  await api_call.json();
    return {data};
};


/**
 * Function consuming get requests on URL '/' , sending JSON to the view and rendering the view
 */
// WITH Promises -> Resolution of the promise is implemented in .then()
router.get('/', function (req, res) {

    let dataToSend = [];

    fetchData (`${URL}/data/Horsens`).then(result => {
            dataToSend = {
                //Data that are gotten from query parameters (Always specifying defaults)
                //requiredRows: req.query.rows || '25',
                //startIndex: req.query.startIndex || 1,
                //Actual data from the promise that are sorted right away based on query parameter sortBy
                result: result.data.sort((a, b) => {
                    return (a.time < b.time) - (a.time > b.time);

                }),
            };
        let pastData = histData(dataToSend);

        fetchPredictions(`${URL}/forecast/Horsens`).then(result => {
            dataToSend2 = {
                result: result.data.sort((a, b) => {
                    return (a.time < b.time) - (a.time > b.time);
                })
            };
            let forecasts = predictions(dataToSend2);
            console.log({forecasts});
            res.render('index',{pastData,forecasts});
        });
    });
    //This is the XMLHttpRequest part bellow, does the same thing.
    /*const request = new XMLHttpRequest();
    request.open('GET','http://localhost:8080/data/Horsens');
    request.onload = () =>{
        const response = JSON.parse(request.responseText);
        dataToSend = {
            result : response.sort((a, b) => {
                return (a.time < b.time) - (a.time > b.time);

            }),
        };
        const pastData = histData(dataToSend);
        console.log(pastData);
        res.render('index',{pastData});
    }
    request.send()*/

});

const predictions = (dataToSend) =>{

    const hourlyPredictions = () =>{
        const oneDayBack = new Date();
        oneDayBack.setDate(oneDayBack.getDate() + 1);
        return dataToSend.result.filter(_ => new Date(_.time).valueOf() <= oneDayBack.valueOf())
    };
    const output = hourlyPredictions();
    return output;

}


const histData = (dataToSend) => {

    const latestAll = () =>{
        const latestTemperature  = dataToSend.result.filter(_=> _.type==='temperature')[0];
        const latestWind = dataToSend.result.filter(_=> _.type==='wind speed')[0];
        const latestPrec = dataToSend.result.filter(_=> _.type==='precipitation')[0];
        const latestCloud = dataToSend.result.filter(_=> _.type==='cloud coverage')[0];

        return {
            latestTemperature,
            latestPrec,
            latestWind,
            latestCloud
        }

    }

    const minimumTemperatureForFiveDays = () => {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const minimumTemp = dataToSend.result.filter(_ => _.type === 'temperature').filter(_ => new Date(_.time).valueOf() >= fiveDaysAgo.valueOf()).sort((a, b) => a.value - b.value)[0]
        return {minimumTemp}
    };
    const maximumTemperatureForFiveDays = () => {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const maximumTemp= dataToSend.result.filter(_ => _.type === 'temperature').filter(_ => new Date(_.time).valueOf() >= fiveDaysAgo.valueOf()).sort((a, b) => b.value - a.value)[0];
        return {maximumTemp}
    };
    const totalPrecipitationForFiveDays = () =>{
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const totalPrec = dataToSend.result.filter(_ => _.type === 'precipitation').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value).reduce((a,b)=>a+b);
        return {totalPrec}

    };
    const averageWindSpeedForFiveDays = () =>{
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const windDataFor5Days =  dataToSend.result.filter(_ => _.type === 'wind speed').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value);
        const avgWind = windDataFor5Days.reduce((a,b)=>a+b)/ windDataFor5Days.length;
        return {avgWind}

    };
    const averageCloudsForFiveDays = () =>{
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const cloudDataFor5Days =  dataToSend.result.filter(_ => _.type === 'cloud coverage').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value);
        const avgCloud = cloudDataFor5Days.reduce((a,b)=>a+b)/ cloudDataFor5Days.length;
        return {avgCloud}

    };
    const dominantWindDirection = () => {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const allWinds = dataToSend.result.filter(_ => _.type === 'wind speed').filter(_ => new Date(_.time)
            .valueOf() >= fiveDaysAgo.valueOf()).map(_ => _.direction)
        const directionsMap = {};
        allWinds.forEach(direction => {
            if(directionsMap[direction] >=0){
                directionsMap[direction]++
            } else{
                directionsMap[direction] = 0
            }
        });
        let dominantWind ='';
        for(var item in directionsMap){
            let currentDominantDirection = directionsMap[dominantWind]
            if(!currentDominantDirection)
                currentDominantDirection = 0;
            if (directionsMap[item]> currentDominantDirection)
                dominantWind = item;
        }

        return {dominantWind}
    };
    return [
        latestAll(),
        minimumTemperatureForFiveDays(),
        maximumTemperatureForFiveDays(),
        totalPrecipitationForFiveDays(),
        averageWindSpeedForFiveDays(),
        dominantWindDirection(),
        averageCloudsForFiveDays()
        ]
};
//Module export that defines how to locate this
module.exports = router;
