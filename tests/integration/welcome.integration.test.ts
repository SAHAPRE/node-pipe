import request from "supertest";
import app from "../../src/app";

describe("Integration Test - Welcome Endpoint", () => {

  it("should return correct JSON response", async () => {

    const response = await request(app)
      .get("/api/v1/users")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.message)
      .toBe("Welcome to Amazon EC2 Deployment with Node.js");

  });

});

