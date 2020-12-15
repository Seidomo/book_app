'use strict';


const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3001;



// https://www.googleapis.com/books/v1/volumes?q= (search)

app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));
// app.use(axios());
app.set('view engine', 'ejs');

app.get('/hello', sayingHello);
app.get('/search', newSearch);
app.post('/searches/new', searching);


function sayingHello(req, res){
    res.render('pages/index.ejs' );
}

function newSearch(req, res){
    res.render('pages/searches/new.ejs' );
}

function searching(req, res) {
console.log(req.body);
let searchType;
const searchTerm = req.body[0];
if (req.body[1] === 'author') {
    searchType = 'inauthor';
} else {
    req.body[1] === 'title' 
    searchType = 'intitle';
}
const bookSearchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}+${searchType}`

    return superagent.get(bookSearchURL)
        .then(bookSearchReturn => {
/*             let bookSearchArray = bookSearchReturn.body. */
console.log(bookSearchReturn.body.title)
        })
}


















app.use('*',(request, response) => {
    response.status(404).send('Sorry! something wrong ');
});


    app.listen(PORT, ()=> console.log(` app is listening ${PORT}`));
