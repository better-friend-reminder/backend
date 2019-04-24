const request = require("supertest");

const server = require("../api/server");
const db = require("../data/dbConfig");

beforeEach(async () => {
  await db("users").truncate(); // reset the database before test
});

describe("POST /api/register", () => {
  it("should set testing environment", () => {
    expect(process.env.DB_ENV).toBe("testing");
  });

  it("should return status 400 if no username or password provided", async () => {
    const res = await request(server)
      .post("/api/register")
      .send({})
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({
      errorMessage: "Please provide a email, and password."
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
