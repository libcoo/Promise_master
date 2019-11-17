/*
•	Instead of always showing data for all the cities, allow the user to choose a city to show data from.
•	Allow the user to choose a time interval to show data for. This should work for both historical and predictive data.
•	Allow the user to reload the data from the server without reloading the entire page.
•	Allow the user to report historical data to the server.
•	All user actions should refresh the data, but not the entire page.

Implement an object-oriented version of this using 2-way data binding.
You may use AngularJS or another framework for this, but it is not required.
 */

angular.module("weatherApp", [])
    .controller('weatherController', function () {
        var weatherCon = this;

        weatherCon.addData = function() {
            console.log("Button was pressed");
            const data = [{
                place: weatherCon.place,
            time: weatherCon.dateTime,
            value: weatherCon.value,
            type: weatherCon.type,
            unit: weatherCon.unit
            }];

            fetch('http://localhost:8080/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(content => {
                    console.log(content);
                })
        };

        weatherCon.reload = function () {
            // TODO
        }
        
        weatherCon.filterData = function () {

        }

        weatherCon.list = function () {
            // Here we should get all the data from the server

        }

    });


// type: Temperature Precipitation, Wind, Cloud historical forecast
// value type, direction unit time place
// predictions has range from to