const notes = require('express').Router();
const { v4: uuidv4 } = require('uuid'); // gives unique identifiers 

const {
    readFromFile,
    readAndAppend,
    writeToFile,
  } = require('../helpers/fsUtils.js'); 

  // GET Route for retrieving all the notes
notes.get('/', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });

// GET Route for retrieving a specific note
notes.get('/:note_id', (req, res) => {
  const noteId = req.params.note_id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((note) => note.note_id === noteId);
      return result.length > 0
        ? res.json(result)
        : res.json('No note with that ID');
    });
});

  // DELETE Route for a specific note
notes.delete('/:note_id', (req, res) => {
  console.log('Request Parameters:', req.params.note_id); // Log request parameters
    const noteId = req.params.note_id;
    console.log(`Deleting note with ID: ${noteId}`);
    
    readFromFile('./db/db.json')
      .then((data) => {
      console.log('Data read from file:', data);
       return JSON.parse(data);
      })
      .then((json) => {
        console.log('Existing notes:', json);

        
        // Log the data type of the note_id property for each note
        json.forEach((note) => {
          console.log(`Data type of note_id for note with title '${note.title}': ${typeof note.note_id}`);
      });

        // Make a new array of all notes except the one with the ID provided in the URL
        const result = json.filter((note) => note.id !== String(noteId));
        // console.log('Filtered notes:', result);
        // Save that array to the filesystem
        writeToFile('./db/db.json', result);
        // console.log('Note deleted successfully.');
        // Respond to the DELETE request
        res.json(`Item ${noteId} has been deleted 🗑️`);
      })
      .catch((err) => {
        // console.error('Error deleting note:', err);
        res.status(500).json({ error: 'Failed to delete note.' });
    });
  });

// POST Route for a new UX/UI note
notes.post('/', (req, res) => {
    console.log(req.body);
  
    const { title, text } = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuidv4(),
      };
  
      readAndAppend(newNote, './db/db.json');
      res.json(`Note added successfully`);
    } else {
      res.error('Error in adding note');
    }
  });

  module.exports = notes;