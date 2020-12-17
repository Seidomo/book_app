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
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', homePage);
app.get('/hello', sayingHello);
app.get('/searches/new', newSearch);
app.get('/books/:id', bookDetails);
app.post('/search', searching);


function homePage(req, res) {
    client.query('SELECT * FROM books')
          .then(result => {
              let savedBooks = result.rows;
              
               res.render('pages/index.ejs',{nsBooks: savedBooks}, {bookCount : savedBooks.length});
               

            })
    
}
function sayingHello(req, res){
    res.render('pages/index.ejs');
}
// function showError(req, res){
//     res.status(404).render('pages/error.ejs');}


function newSearch(req, res) {
    res.render('pages/searches/new.ejs');
}
function bookDetails(req, res){
    client.query('SELECT * FROM books WHERE id=$1', [req.params.id])
          .then(result => {
              let booksInDetail = result.rows[0]
              res.render('pages/books/detail.ejs', {nsBooks : booksInDetail });
          })

    

}

function searching(req, res) {
    console.log(req.body);
    const bookSearchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchType}+${searchTerm}`
    superagent.get(bookSearchURL)
        .then(bookSearchReturn => {
            const bookSearchArray = bookSearchReturn.body.items.map(instanceBook => new Book(instanceBook));

            res.render('pages/searches/show', { bookSearchArray: bookSearchArray })
        })

    let searchType;
    const searchTerm = req.body.search[0];
    if (req.body.search[1] === 'author') {
        searchType = 'inauthor';
    } else {
        searchType = 'intitle';
    }

    
}



function Book(books) {
    this.title = books.volumeInfo.title;
    this.authors = books.volumeInfo.authors &&books.volumeInfo.authors[0] || 'UNKNOWN';
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








// const bookSql = `INSERT INTO books (title, authors, description, image_url, isbn) VALUES ($1, $2, $3, $4, $5)`;
// client.query(bookSql, [bookSearchArray.title, bookSearchArray.authors, bookSearchArray.description, bookSearchArray.image_url, bookSearchArray.isbn]);