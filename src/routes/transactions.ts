import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transaction").select("*");

    return {
      transactions,
    };
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transaction").where("id", id).first();

    return {
      transaction,
    };
  });

  app.get("/summary", async () => {
    const summary = await knex("transaction")
      .sum("amount", { as: "amount" })
      .first();

    return {
      summary,
    };
  });

  app.post("/", async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const body = createTransactionSchema.parse(request.body);

    await knex("transaction").insert({
      id: randomUUID(),
      title: body.title,
      amount: body.type === "credit" ? body.amount : body.amount * -1,
    });

    return reply.status(201).send();
  });
}
