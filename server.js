// Require Express
const express = require('express');
const path = require('path');
const { clog } = require('./middleware/clog');
const api = require('./routes/index.js');
const PORT = process.env.PORT || 3001;
// Create an instance of the Express application
const app = express();


// Use port from environment variable for Heroku deployment or 3001 for local
const port = process.env.PORT || 3001;

// Import custom middleware, "cLog"
app.use(clog);

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', api);
app.use(express.static('public')); // allows public folder to be used in express

// GET Route for homepage
app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname, '/public/index.html'))
});
// GET Route for notes
app.get('/notes', (req, res) => {
res.sendFile(path.join(__dirname, '/public/notes.html')) 
});

// Wildcard route to direct users to index.html
app.get('*', (req, res) => {


  res.sendFile(path.join(__dirname, 'public/index.html'))
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);


