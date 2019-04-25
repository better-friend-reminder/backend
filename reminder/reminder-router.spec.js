const request = require("supertest");
const bcrypt = require("bcryptjs");

const server = require("../api/server");

const db = require("../data/dbConfig");

afterEach(async () => {
  await db("reminders").truncate(); // reset the database before test
  await db("users").truncate();
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

  describe("DELETE /:id", () => {
    it("should return status 401 if user not logged in", async () => {
      const res = await request(server).delete("/api/reminders/11");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        errorMessage: "You have to login first."
      });
    });

    it("If user logged in, should return status 200", async () => {
      const user = { username: "Leila1", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      // add a reminder
      const reminder = {
        user_id: response.body.userId,
        recipientName: "Papa",
        recipientEmail: "papa@papa.com",
        message: "Hello Papa From API",
        category: "family",
        sent: false,
        sendDate: 1556139895242
      };
      const reminderId = await db("reminders").insert(reminder);

      // delete the reminder
      const res = await request(server)
        .delete(`/api/reminders/${reminderId}`)
        .set({ authorization: token });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it("If user logged in, should return status 400 if the reminder id is invalid", async () => {
      const user = { username: "Leila2", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      // delete the reminder
      const res = await request(server)
        .delete(`/api/reminders/100`)
        .set({ authorization: token });

      expect(res.status).toBe(400);
      expect(res.body.count).toBe(0);
    });
  });

  describe("PUT /:id", () => {
    it("should return status 401 if user not logged in", async () => {
      const res = await request(server).put("/api/reminders/11");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        errorMessage: "You have to login first."
      });
    });

    it("should return status 400 if no information provided in request body", async () => {
      const user = { username: "Leila3", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const res = await request(server)
        .put("/api/reminders/11")
        .set({ authorization: token });
      expect(res.status).toBe(400);
    });

    it("should return status 400 if the reminder id is invalid", async () => {
      const user = { username: "Leila4", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const res = await request(server)
        .put("/api/reminders/10")
        .set({ authorization: token })
        .send({ message: "Changed message!" });
      expect(res.status).toBe(400);
      expect(res.body.count).toBe(0);
    });

    it("should return status 200 when reminder is updated", async () => {
      const user = { username: "Leila5", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const reminder = {
        user_id: response.body.userId,
        recipientName: "Papa",
        recipientEmail: "papa@papa.com",
        message: "Hello Papa From API",
        category: "family",
        sent: false,
        sendDate: 1556139895242
      };
      const reminderId = await db("reminders").insert(reminder);

      const res = await request(server)
        .put(`/api/reminders/${reminderId}`)
        .set({ authorization: token })
        .send({ message: "Hello Papa from API testing!" });
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });
  });

  describe("GET /:id", () => {
    it("should return status 401 if user not logged in", async () => {
      const res = await request(server).get("/api/reminders/11");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        errorMessage: "You have to login first."
      });
    });

    it("should return status 400 if reminder id is not valid", async () => {
      const user = { username: "Leila6", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const res = await request(server)
        .get("/api/reminders/10")
        .set({ authorization: token });
      expect(res.status).toBe(400);
    });

    it("should return a status 200 if reminder with the id is found", async () => {
      const user = { username: "Leila7", password: "password" };
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;
      const response = await request(server)
        .post("/api/register")
        .send(user);
      const token = response.body.token;

      const reminder = {
        user_id: response.body.userId,
        recipientName: "Mama",
        recipientEmail: "mama@mama.com",
        message: "Hello Mama From API",
        category: "family",
        sent: false,
        sendDate: 1556139895242
      };
      const reminderId = await db("reminders").insert(reminder);

      const res = await request(server)
        .get(`/api/reminders/${reminderId}`)
        .set({ authorization: token });
      expect(res.status).toBe(200);
    });
  });
});
