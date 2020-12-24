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
const methodOverride = require('method-override');



client.on('error', (error) => console.error(error))




app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



app.use(methodOverride('_method')); 
app.get('/', homePage);
app.get('/hello', sayingHello);
app.get('/searches/new', newSearch);
app.get('/books/:id', bookDetails);
app.post('/searches/new', searching);
app.post('/books', saveBooks);
app.get('/books/edit/:id', bookEdit);
app.put('/books/saveedit', saveEdit);





function saveEdit(req, res) {
    console.log(req.body); 
        const saveBookID = req.body.id;
        const saveBookTitle = req.body.title;
        const saveBookAuthors = req.body.authors;
        const saveBookDescription = req.body.description;
        const saveBookImageUrl = req.body.image_url;
        const saveBookISBN = req.body.isbn;
    client.query(
            'UPDATE books SET title=$2, authors=$3, description=$4, image_url=$5, isbn=$6 WHERE id=$1 RETURNING id',
            [saveBookID, saveBookTitle, saveBookAuthors, saveBookDescription, saveBookImageUrl, saveBookISBN]
        )
            .then((result) => {
                const editBookID = result.rows[0].id;
                res.redirect(`/books/${editBookID}`);
            });
    }


function bookEdit(req, res){
    console.log(req.params.id);
    client.query('SELECT * FROM books WHERE id=$1', [req.params.id])
          .then(result => {
              let booksInDetail = result.rows[0];
              res.render('pages/books/edit', {book : booksInDetail });
          })
}


function homePage(req, res) {
    client.query('SELECT * FROM books')
          .then(result => {
              let savedBooks = result.rows;
/*               console.log(savedBooks); */
               res.render('pages/index.ejs',{nsBooks: savedBooks});
            })
}


function sayingHello(req, res){
    res.render('pages/index.ejs');
}


function newSearch(req, res) {
    res.render('pages/searches/new.ejs');
}


function bookDetails(req, res){
    console.log(req.params.id);
    client.query('SELECT * FROM books WHERE id=$1', [req.params.id])
          .then(result => {
              let booksInDetail = result.rows[0];
              res.render('pages/books/detail', {book : booksInDetail });
          })
}


function searching(req, res) {
    let searchType;
    const searchTerm = req.body.search[0];
    if (req.body.search[1] === 'author') {
        searchType = 'inauthor';
    } else {
        searchType = 'intitle';
    }
    const bookSearchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchType}:${searchTerm}`
    superagent.get(bookSearchURL)
        .then(bookSearchReturn => {
            const bookSearchArray = bookSearchReturn.body.items.map(instanceBook => new Book(instanceBook));
            res.render('pages/searches/show', { bookSearchArray: bookSearchArray })
/*             console.log(bookSearchArray); */
        })
}


function saveBooks(req, res) {
/*     console.log(req.body); */
    const bookTitle = req.body.title;
    const bookAuthors = req.body.authors;
    const bookDescription = req.body.description;
    const bookImageUrl = req.body.image_url;
    const bookISBN = req.body.isbn;
client.query(
        'INSERT INTO books (title, authors, description, image_url, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING id;',
        [bookTitle, bookAuthors, bookDescription, bookImageUrl, bookISBN]
    )
        .then((result) => {
            const newestID = result.rows[0].id;
            console.log(newestID); 
            res.redirect(`/books/${newestID}`);
        });
}


function Book(books) {
    this.title = books.volumeInfo.title;
    this.authors = books.volumeInfo.authors && books.volumeInfo.authors[0] || 'UNKNOWN';
    this.description = books.volumeInfo.description;
    /////// got this from the code review /////
    this.image_url = books.volumeInfo.imageLinks ? books.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = 'ISBN not found';
 /*    this.isbn = (books.volumeInfo.industryIdentifiers[0].type + ': ' + books.volumeInfo.industryIdentifiers[0].identifier) ? 'ISBN not found' : 'ISBN not found'; */
}













app.use('*', (request, response) => {
    response.status(404).send('Sorry! something wrong ');
});

client.connect().then(() => {
    app.listen(PORT, () => console.log(` app is listening ${PORT}`));
})








// const bookSql = `INSERT INTO books (title, authors, description, image_url, isbn) VALUES ($1, $2, $3, $4, $5)`;
// client.query(bookSql, [bookSearchArray.title, bookSearchArray.authors, bookSearchArray.description, bookSearchArray.image_url, bookSearchArray.isbn]);