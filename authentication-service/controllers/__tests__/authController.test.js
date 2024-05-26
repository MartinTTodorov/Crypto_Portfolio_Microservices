const request = require('supertest');
const server = require('../../server');
const db = require('../../db/db');

afterAll(done => {
  server.close();
  done();
});

describe('Authentication Controller', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  it('should register a new user', async () => {
    const newUser = { username: 'testuser', password: 'testpassword' };

    const response = await request(server)
      .post('/api/auth/register')
      .send(newUser)
      .expect(201);

    expect(response.body.username).toBe(newUser.username);
  });

  it('should return 500 Internal Server Error', async () => {
    const existingUser = { username: 'existing', password: 'testpassword' };
    await request(server)
      .post('/api/auth/register')
      .send(existingUser);
  
    // Attempt to register the same user again
    await request(server)
      .post('/api/auth/register')
      .send(existingUser)
      .expect(500);
  });

  // Invalid credentials
  it('should return 401 Unauthorized for invalid login', async () => {
    const invalidCredentials = { username: 'nonexistent', password: 'incorrect' };
    await request(server)
      .post('/api/auth/login')
      .send(invalidCredentials)
      .expect(401);
  });
  

  it('should log in an existing user', async () => {
    // Register a user
    const newUser = { username: 'testuser', password: 'testpassword' };
    await request(server)
      .post('/api/auth/register')
      .send(newUser);

    // Log in the registered user
    const response = await request(server)
      .post('/api/auth/login')
      .send(newUser)
      .expect(200);

    expect(response.body.message).toBe('Login successful');
  });
});
