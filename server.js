'use strict';


const express = require('express');
// const superagent = require('superagent');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.static('public'));
// app.use(axios());
app.set('view engine', 'ejs');

app.get('/hello', sayingHello);
app.get('/search', newSearch);



function sayingHello(req, res){
    res.render('pages/index.ejs' );
}

function newSearch(req, res){
    res.render('pages/searches/new.ejs' );
}


















app.use('*',(request, response) => {
    response.status(404).send('Sorry! something wrong ');
});


    app.listen(PORT, ()=> console.log(` app is listening ${PORT}`));
