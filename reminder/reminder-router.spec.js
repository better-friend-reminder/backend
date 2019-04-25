const request = require("supertest");
const bcrypt = require("bcryptjs");

const server = require("../api/server");

const db = require("../data/dbConfig");

beforeEach(async () => {
  await db("reminders").truncate(); // reset the database before test
});

describe("reminder-router.js", () => {
  it("should set testing environment", () => {
    expect(process.env.DB_ENV).toBe("testing");
  });

  describe("GET /", () => {
    it("Should return status 401 if user not logged in", async () => {
      const res = await request(server).get("/api/reminders");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        errorMessage: "You have to login first."
      });
    });

    it("If user logged in, should return status 200 and return an array", async () => {
      const user = { username: "Leila10", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;
      const res = await request(server)
        .get("/api/reminders")
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe("POST /", () => {
    it("should return status 401 if user not logged in", async () => {
      const res = await request(server).get("/api/reminders");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        errorMessage: "You have to login first."
      });
    });

    it("If user logged in, should return status 201", async () => {
      const user = { username: "Leila100", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const reminder = {
        recipientName: "Papa",
        recipientEmail: "papa@papa.com",
        message: "Hello Papa From API",
        category: "family",
        sendDate: 1556139895242
      };
      const res = await request(server)
        .post("/api/reminders")
        .set({ authorization: token })
        .send(reminder);
      expect(res.status).toBe(201);
    });
  });
});
