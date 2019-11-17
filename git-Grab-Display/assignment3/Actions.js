const dispatcher = require('./Dispatcher');

function refresh(){
    dispatcher.dispatch({
        type : "Refresh"
    })
}
module.exports = refresh;
