const request = require("supertest");
const bcrypt = require("bcryptjs");

const server = require("../api/server");
const db = require("../data/dbConfig");

beforeEach(async () => {
  await db("users").truncate(); // reset the database before test
});

describe("auth-router.js", () => {
  it("should set testing environment", () => {
    expect(process.env.DB_ENV).toBe("testing");
  });
});

describe("POST /api/register", () => {
  it("should return status 400 if no username or password provided", async () => {
    const res = await request(server)
      .post("/api/register")
      .send({})
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({
      errorMessage: "Please provide a username, and password."
    });
  });

  it("should return status 201 if no problems", async () => {
    const user = { username: "Leila", password: "password" };

    const res = await request(server)
      .post("/api/register")
      .send(user)
      .set("Accept", "application/json");
    expect(res.status).toBe(201);
    expect(res.type).toBe("application/json");
  });
});

describe("POST /api/login", () => {
  it("should return status 400 if no username or password provided", async () => {
    const res = await request(server)
      .post("/api/login")
      .send({})
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({
      errorMessage: "Please provide a username, and password."
    });
  });

  it("should return status 400 if username or password are invalid", async () => {
    const user = { username: "Leila10", password: "password" };
    const res = await request(server)
      .post("/api/login")
      .send(user)
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({
      errorMessage: "Invalid Credentials"
    });
  });

  it("should return status 200 if username and password are valid", async () => {
    // Add a user to the database so we can login
    const newUser = { username: "Leila", password: "password" };
    const hash = bcrypt.hashSync(newUser.password, 10); //2 ^ n times
    //override use.password with hash
    newUser.password = hash;
    await db("users").insert(newUser);

    const user = { username: "Leila", password: "password" };
    const res = await request(server)
      .post("/api/login")
      .send(user)
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    expect(res.type).toBe("application/json");
    expect(res.body.message).toBe("Welcome Leila!");
  });
});
