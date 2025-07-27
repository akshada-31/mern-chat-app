const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Use refactored app
const User = require('../models/userModel');

process.env.JWT_SECRET = "testsecret"; // Fix JWT issue

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();

    // Seed test user
    await User.create({
        name: "Akshada",
        email: "akshada@example.com",
        password: "password123"
    });
});

describe("POST /api/user/login", () => {
    it("should return 200 and user info for valid credentials", async () => {
        const res = await request(app).post("/api/user/login").send({
            email: "akshada@example.com",
            password: "password123"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.email).toBe("akshada@example.com");
    });

    it("should return 400 for missing fields", async () => {
        const res = await request(app).post("/api/user/login").send({
            email: ""
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Please enter all the fields/i);
    });
});
