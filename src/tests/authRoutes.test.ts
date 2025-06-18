import request from 'supertest';
import app from '../index';
import User from '../models/User';
import { MockUserModel } from '../types/jest.setup';

jest.mock('../models/User');
const mockedUser = User as jest.MockedClass<typeof User> & MockUserModel;


describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token + user info', async () => {
      // Mock User.findOne to return null (no existing user)
      mockedUser.findOne = jest.fn().mockResolvedValue(null);
      // Mock user instance and save
      const saveMock = jest.fn().mockResolvedValue(true);
      mockedUser.prototype.save = saveMock;

      // Mock new user created
      const newUser = {
        _id: 'someid',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        profileImage: 'http://example.com/avatar',
        createdAt: new Date(),
        save: saveMock,
      };
      // When new User() is called, return the above object
      mockedUser.mockImplementation(() => newUser as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should return 400 if required fields missing', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 if user already exists by email', async () => {
      mockedUser.findOne = jest.fn()
        .mockResolvedValueOnce({}) // first call to find email returns user (exists)
        .mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', email: 'exists@example.com', password: 'password' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return token + user info', async () => {
      // Mock found user with comparePassword method
      const mockComparePassword = jest.fn().mockResolvedValue(true);
      const user = {
        _id: 'someid',
        username: 'testuser',
        email: 'test@example.com',
        profileImage: 'http://example.com/avatar',
        createdAt: new Date(),
        comparePassword: mockComparePassword,
      };
      mockedUser.findOne = jest.fn().mockResolvedValue(user);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({ email: 'test@example.com' });
      expect(mockComparePassword).toHaveBeenCalledWith('password123');
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 404 if user not found', async () => {
      mockedUser.findOne = jest.fn().mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'password' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it('should return 401 if password invalid', async () => {
      const user = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      mockedUser.findOne = jest.fn().mockResolvedValue(user);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return list of users', async () => {
      const users = [
        { _id: '1', username: 'user1', email: 'user1@test.com' },
        { _id: '2', username: 'user2', email: 'user2@test.com' },
      ];
      mockedUser.find = jest.fn().mockResolvedValue(users);

      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(users);
    });
  });
});
