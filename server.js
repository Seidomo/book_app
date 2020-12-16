'use strict';


const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const app = express();
const pg = require('pg');

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);


client.on('error', (error) => console.error(error))



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
    client.query('SELECT * FROM books WHERE title=$1', [req.body.search])
        .then(book => {
            if (book.rows.length !== 0) {
                console.log(book.rows);
                res.send(book.rows[0]);
            } else {
                const bookSearchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchType}+${searchTerm}`
                superagent.get(bookSearchURL)
                    .then(bookSearchReturn => {
                        const bookSearchArray = bookSearchReturn.body.items.map(instanceBook => new Book(instanceBook));
                        const bookSql = `INSERT INTO books (title, authors, description, image_url, isbn) VALUES ($1, $2, $3, $4, $5)`;
                        client.query(bookSql, [bookSearchArray.title, bookSearchArray.authors, bookSearchArray.description, bookSearchArray.image_url, bookSearchArray.isbn]);
                        res.render('pages/searches/show', { bookSearchArray: bookSearchArray })
                        console.log(client.query);
                    })
            }
        })
}




function Book(books){
    this.title = books.volumeInfo.title;
    this.authors = books.volumeInfo.authors;
    this.description = books.volumeInfo.description;
    /////// got this from the code review /////
    this.image_url = books.volumeInfo.imageLinks ? books.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = books.volumeInfo.isbn;
}













app.use('*', (request, response) => {
    response.status(404).send('Sorry! something wrong ');
});

client.connect().then(() => {
    app.listen(PORT, () => console.log(` app is listening ${PORT}`));
})