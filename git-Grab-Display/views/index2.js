import Model from './model.js'
import ViewModel from './view-model.js'
import View from './view.js'


const load = () => {
    Promise.all([fetch('http://localhost:8080/data').then(res => res.json()),
        fetch('http://localhost:8080/forecast').then(res => res.json())])
        .then(([historicalData, predictionData]) => {
            const model = Model(historicalData, predictionData)
            const viewModel = ViewModel(model)
            View(viewModel)
        })

}

const postData = data => {
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
}

const init = () => {
    load()

    document.getElementById('button-reload').addEventListener("click", () => {
        load()
    });

    document.getElementById('button-post').addEventListener("click", () => {
        const data = [{
            type: "temperature",
            time: document.getElementById('input-temp-date').value,
            place: document.getElementById('input-temp-place').value,
            value: Number(document.getElementById('input-temp-value').value),
            unit: document.getElementById('input-temp-unit').value,
        }]
        console.log(JSON.stringify(data))
        postData(data)
    });

}

init()