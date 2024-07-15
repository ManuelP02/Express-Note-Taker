const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to read notes
const readNotes = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading notes:', err);
    return [];
  }
};

// Helper function to write notes
const writeNotes = async (notes) => {
  try {
    await fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes));
  } catch (err) {
    console.error('Error writing notes:', err);
  }
};

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API Routes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Error reading notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const notes = await readNotes();
    const newNote = { 
      id: uuidv4(),
      title: req.body.title,
      text: req.body.text
    };
    notes.push(newNote);
    await writeNotes(notes);
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: 'Error saving note' });
  }
});



app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    let notes = await readNotes();
    notes = notes.filter(note => note.id !== noteId);
    await writeNotes(notes);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting note' });
  }
});

// Wildcard route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});