require('dotenv').config({ path: './.env.test' });
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const generateToken = require('../config/generateToken');

let mongoServer, token, userId, chatId, messageId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const user = await User.create({
        name: 'Akshada',
        email: 'akshada@example.com',
        password: 'password123',
    });

    token = generateToken(user._id);
    userId = user._id;

    const chat = await Chat.create({
        chatName: 'Test Chat',
        isGroupChat: false,
        users: [user._id],
    });

    chatId = chat._id;

    const message = await Message.create({
        sender: user._id,
        content: 'Original Message',
        chat: chatId,
    });

    messageId = message._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('PUT /api/message/:id', () => {
    it('should edit a message successfully', async () => {
        const res = await request(app)
            .put(`/api/message/${messageId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Updated Message' });

        expect(res.statusCode).toBe(200);
        expect(res.body.content).toBe('Updated Message');
    });
});

describe('DELETE /api/message/:id', () => {
    it('should delete a message successfully', async () => {
        const res = await request(app)
            .delete(`/api/message/${messageId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Message deleted/i);
    });
});
