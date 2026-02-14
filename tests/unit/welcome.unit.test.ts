import request from "supertest";
import app from "../../src/app";

describe("Unit Test - Welcome API", () => {

  it("should return welcome message with status 202", async () => {

    const response = await request(app).get("/api/v1/users");

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      message: "Welcome to Amazon EC2 Deployment with Node.js"
    });

  });

});

