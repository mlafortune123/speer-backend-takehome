const express = require('express');
const checkJwt = require('./middleware');
const pool = require("./credentials.js")
const notes = require("./apis/notes.js")
const authApis = require("./apis/authApis.js")
const cors = require('cors');
const startUp = require("./postgresql/startUp.js")
const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();

const port = process.env.PORT || 3000;


app.post("/api/auth/signup", authApis.signup); // Signup route
app.post("/api/auth/login", authApis.login); // Login route

app.get("/api/notes", checkJwt, notes.getAllNotes); // Get all notes for authenticated user
app.get("/api/notes/:id", checkJwt, notes.getNoteById); // Get a note by ID for authenticated user
app.post("/api/notes", checkJwt, notes.createNote); // Create a new note for authenticated user
app.put("/api/notes/:id", checkJwt, notes.updateNote); // Update an existing note by ID for authenticated user
app.delete("/api/notes/:id", checkJwt, notes.deleteNote); // Delete a note by ID for authenticated user
app.post("/api/notes/:id/share", checkJwt, notes.shareNote); // Share a note with another user
app.get("/api/search", checkJwt, notes.searchNotes); // Search notes based on query for authenticated user
//this code is for running the postgresql start up commands, and making sure the connection even works in the first place
let server;

function startServer() {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3000;
    server = app.listen(port, '0.0.0.0', () => {
      pool.connect((err, client, release) => { 
        if (err) {
          reject(err);
        } else {
          console.log("Database connected successfully! Running startup commands");
          client.query(startUp, (error, results) => {
            release(); // Always release the client
            if (error) {
              reject(error);
            } else {
              console.log('Startup complete');
              resolve(server);
            }
          });
        }
      });
    });
  });
}

// Only start the server if we're running the app directly (not in a test)
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = {
  app,
  startServer
};