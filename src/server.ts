import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "crypto";
import { env } from "./env";

const app = fastify();

app.get("/hello", async () => {
  const transaction = await knex("transaction").select("*");

  return transaction;
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Server is running on port 3333");
  });
