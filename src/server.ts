import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "crypto";

const app = fastify();

app.get("/hello", async () => {
  const transaction = await knex("transaction").select("*");

  return transaction;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server is running on port 3333");
  });
