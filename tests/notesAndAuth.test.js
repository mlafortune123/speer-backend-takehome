const request = require('supertest');
const { app, startServer } = require('../index.js');
const pool = require('../credentials'); // Make sure to use the correct path

let token; // Store the token for the test
let secondUserToken; // Store the second user's token
let secondUserId
beforeAll(async () => {
  serverInstance = await startServer();
  const signupResponse = await request(app)
    .post('/api/auth/signup') // Corrected signup URL
    .send({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: 'password123'
    });

  expect(signupResponse.status).toBe(201);
  token = signupResponse.body.token; // Store token for the first user

  // Sign up second user (User 2)
  const secondSignupResponse = await request(app)
    .post('/api/auth/signup') // Corrected signup URL
    .send({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password456'
    });

  expect(secondSignupResponse.status).toBe(201);
  secondUserToken = secondSignupResponse.body.token; // Store token for the second user
  secondUserId = secondSignupResponse.body.id;  // Get the user ID of the second user
    // Check if the users exist
    const usersResponse = await pool.query('SELECT * FROM users');
    console.log(usersResponse.rows); // This will print all users
});

// Clean up after tests

afterAll(async () => {
  await pool.query('DELETE FROM users'); // Clean up test data

  // Properly close the server
  if (serverInstance) {
    await new Promise((resolve, reject) => {
      serverInstance.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Close the pool
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing the pool:', error);
  }
});

describe('Notes API', () => {

  // Test createNote endpoint
  it('should create a new note', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Note',
        content: 'This is a test note'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Note');
    expect(response.body.content).toBe('This is a test note');
  });

  // Test getAllNotes endpoint
  it('should get all notes for the authenticated user', async () => {
    const response = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test getNoteById endpoint
  it('should get a note by ID', async () => {
    const noteResponse = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Another Test Note',
        content: 'This is another test note'
      });

    const noteId = noteResponse.body.id;

    const response = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(noteId);
    expect(response.body.title).toBe('Another Test Note');
  });

  // Test updateNote endpoint
  it('should update an existing note', async () => {
    const noteResponse = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Note to Update',
        content: 'This note will be updated'
      });

    const noteId = noteResponse.body.id;

    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Note',
        content: 'This note has been updated'
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Note');
    expect(response.body.content).toBe('This note has been updated');
  });

  // Test deleteNote endpoint
  it('should delete a note', async () => {
    const noteResponse = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Note to Delete',
        content: 'This note will be deleted'
      });

    const noteId = noteResponse.body.id;

    const response = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Note deleted successfully');
  });

  // Test searchNotes endpoint
  it('should search for notes based on a query', async () => {
    const response = await request(app)
      .get('/api/search?q=test')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test shareNote endpoint
  it('should share a note with another user', async () => {
    const noteResponse = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Note to Share',
        content: 'This note will be shared'
      });

    const noteId = noteResponse.body.id;

    const response = await request(app)
      .post(`/api/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        sharedWithUserId: secondUserId,
        noteId
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});