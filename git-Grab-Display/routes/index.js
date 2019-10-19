//Definitions of dependencies
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
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
    const data = await api_call.json();
    return {data};
};
/**
 * Function consuming get requests on URL '/' , sending JSON to the view and rendering the view
 */

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
        const latestTemperature = dataToSend.result.filter(_=> _.type==='temperature')[0];
        const latestWind = dataToSend.result.filter(_=> _.type==='wind speed')[0];
        const latestPrec = dataToSend.result.filter(_=> _.type==='precipitation')[0];
        const latestCloud = dataToSend.result.filter(_=> _.type==='cloud coverage')[0];

        const minimumTemperatureForFiveDays = () => {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            return result.data.filter(_ => _.type === 'temperature').filter(_ => new Date(_.time).valueOf() >= fiveDaysAgo.valueOf()).sort((a, b) => a.value - b.value)[0]
        };
        const maximumTemperatureForFiveDays = () => {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            return result.data.filter(_ => _.type === 'temperature').filter(_ => new Date(_.time).valueOf() >= fiveDaysAgo.valueOf()).sort((a, b) => b.value - a.value)[0]
        };
        const totalPrecipitationForFiveDays = () =>{
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            return result.data.filter(_ => _.type === 'precipitation').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value).reduce((a,b)=>a+b);

        };
        const averageWindSpeedForFiveDays = () =>{
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            const windDataFor5Days =  result.data.filter(_ => _.type === 'wind speed').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value);
            return windDataFor5Days.reduce((a,b)=>a+b)/ windDataFor5Days.length;

        };
        const averageCloudsForFiveDays = () =>{
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            const cloudDataFor5Days =  result.data.filter(_ => _.type === 'cloud coverage').filter(_ => new Date(_.time).valueOf()>= fiveDaysAgo.valueOf()).map(_ => _.value);
            return cloudDataFor5Days.reduce((a,b)=>a+b)/ cloudDataFor5Days.length;

        };
        const dominantWindDirection = () => {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            const allWinds = result.data.filter(_ => _.type === 'wind speed').filter(_ => new Date(_.time).valueOf() >= fiveDaysAgo.valueOf())
            const north = allWinds.filter(_ =>_.direction=='North').length;
            const south = allWinds.filter(_ =>_.direction=='South').length;
            const east = allWinds.filter(_ =>_.direction=='East').length;
            const west = allWinds.filter(_ =>_.direction=='West').length;

            //console.log(allWinds);
            function mapToProp(data,prop){
            return data.reduce((res, item) =>
                Object.assign(res, {
                    name : item[prop],
                    count: 1 + (res[item[prop]] || 0)
                }), Object.create(null));
            }

            console.log(mapToProp(allWinds,'direction'))
        };
        console.log(totalPrecipitationForFiveDays());
        console.log(minimumTemperatureForFiveDays());
        console.log(maximumTemperatureForFiveDays());
        console.log(averageWindSpeedForFiveDays());
        console.log(averageCloudsForFiveDays());

        const output = totalPrecipitationForFiveDays();
        return output;
    });

    const druheData = () =>fetchPredictions(`${URL}/forecast/Horsens`).then(result => {
        dataToSend = {
            result: result.data.sort((a, b) => {
                return (a.time < b.time) - (a.time > b.time);

            })
        };
        const hourlyPredictions = () =>{
            const oneDayBack = new Date();
            oneDayBack.setDate(oneDayBack.getDate() + 1);
            return result.data.filter(_ => new Date(_.time).valueOf() <= oneDayBack.valueOf())
        };
        const output = hourlyPredictions();
        return output;
    });
    const celkoveData = [prveData(),druheData()]
    console.log('Toto su celkove data  : '+celkoveData)
    res.render('index',celkoveData);
});
//Module export that defines how to locate this
module.exports = router;
