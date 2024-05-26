const User = require('../../models/userModel');
const db = require('../../db/db');

jest.mock('../../db/db', () => ({
  query: jest.fn(),
}));

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new user', async () => {
      const mockQueryResult = {
        rows: [{ id: 1, username: 'testUser', password: 'testPass', salt: 'testSalt', role: 'user' }],
      };

      db.query.mockResolvedValue(mockQueryResult);
      const newUser = await User.create('testUser', 'testPass', 'testSalt', 'user');
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['testUser', 'testPass', 'testSalt', 'user']);

      expect(newUser).toEqual({
        id: 1,
        username: 'testUser',
        password: 'testPass',
        salt: 'testSalt',
        role: 'user',
      });
    });

    it('should throw an error if creation fails', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      await expect(User.create('testUser', 'testPass', 'testSalt', 'user')).rejects.toThrow('Error creating user: Database error');
    });
  });

  describe('findByUsername method', () => {
    it('should find a user by username', async () => {
        const mockQueryResult = {
          rows: [{ id: 1, username: 'testUser', password: 'testPass', salt: 'testSalt', role: 'user' }],
        };
      
        db.query.mockResolvedValue(mockQueryResult);
        const foundUser = await User.findByUsername('testUser');
      
        expect(db.query).toHaveBeenCalledWith(expect.any(String), ['testUser']);
      
        expect(foundUser).toEqual({
          id: 1,
          username: 'testUser',
          password: 'testPass',
          salt: 'testSalt',
          role: undefined,
        });
      });

    it('should return null if user is not found', async () => {
      const mockQueryResult = {
        rows: [],
      };

      db.query.mockResolvedValue(mockQueryResult);
      const foundUser = await User.findByUsername('nonexistentUser');
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['nonexistentUser']);
      expect(foundUser).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      await expect(User.findByUsername('testUser')).rejects.toThrow('Error fetching user: Database error');
    });
  });
});
