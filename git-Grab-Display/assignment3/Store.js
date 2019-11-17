const EventEmitter = require('events');
const fetch = require('node-fetch');
const URL = 'http://localhost:8080';
const dispatcher = require('./Dispatcher');


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
class WeatherStore extends EventEmitter{
    constructor(){
        super();
        fetchData (`${URL}/data/Horsens`).then(result => {
            this.dataToSend = {
                //Actual data from the promise that are sorted right away based on query parameter sortBy
                result: result.data.sort((a, b) => {
                    return (a.time < b.time) - (a.time > b.time);

                }),
            };
        });
    }

    getAll()
    {
        console.log("GETALL called");
        return this.dataToSend;
    }
    refresh()
    {
        console.log("Refresh called");
        return this.dataToSend;
    }
    handleActions(action){
        switch (action.type){
            case "Refresh" : {
                this.refresh();
            }
            case "getAll" :{
                this.getAll();
            }
        }
    }

}

const weatherStore = new WeatherStore();
dispatcher.register(weatherStore.handleActions.bind(weatherStore));
module.exports = weatherStore;