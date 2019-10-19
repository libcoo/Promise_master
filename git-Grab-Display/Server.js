//Definitions of dependencies
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;
const app = express();

//Definition of usages
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
//Usage of handlebars view
app.engine('handlebars',hbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');
app.use('/',routes);

app.listen(PORT, ()=>{
    console.log(`server is starting at PORT ${PORT}`);
});
