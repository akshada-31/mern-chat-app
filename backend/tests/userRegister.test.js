process.env.JWT_SECRET = "testsecret"; // Add this before requiring anything else
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env' }); // 👈 forces loading env vars
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/userModel");
const app = require("../app");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();
});

describe("POST /api/user", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/api/user").send({
            name: "Akshada",
            email: "akshada@example.com",
            password: "password123",
            pic: "https://example.com/avatar.jpg",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.email).toBe("akshada@example.com");
    });

    it("should fail if user already exists", async () => {
        await User.create({
            name: "Akshada",
            email: "akshada@example.com",
            password: "password123",
        });

        const res = await request(app).post("/api/user").send({
            name: "Akshada",
            email: "akshada@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/User already exists/i);
    });

    it("should fail if fields are missing", async () => {
        const res = await request(app).post("/api/user").send({
            email: "akshada@example.com",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Please Enter all the Fields/i);
    });
});
