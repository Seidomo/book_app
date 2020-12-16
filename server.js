'use strict';


const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3001;






app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');


app.get('/', sayingHello);
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
const searchTerm = req.body.search[0];
if (req.body.search[1] === 'author') {
    searchType = 'inauthor';
} else {
    
    searchType = 'intitle';
    
}
console.log(searchTerm, searchType);
const bookSearchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchType}+${searchTerm}`

    return superagent.get(bookSearchURL)
        .then(bookSearchReturn => {
          const bookSearchArray = bookSearchReturn.body.items.map(instanceBook => new Book(instanceBook));
       
         res.render('pages/searches/show',{bookSearchArray : bookSearchArray});
        })
}




function Book(books){
    this.title = books.volumeInfo.title;
    this.authors = books.volumeInfo.authors;
    this.description = books.volumeInfo.description;
    /////// got this from the code review /////
    this.imageUrl = books.volumeInfo.imageLinks ? books.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}













app.use('*',(request, response) => {
    response.status(404).send('Sorry! something wrong ');
});


    app.listen(PORT, ()=> console.log(` app is listening ${PORT}`));
