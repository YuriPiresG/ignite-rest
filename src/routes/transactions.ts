import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    console.log(`[${request.method}] ${request.url}]`);
  });
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId;

      const transactions = await knex("transaction")
        .select("*")
        .where("sessions_id", sessionId);

      return {
        transactions,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = request.cookies;

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knex("transaction")
        .where({
          sessions_id: sessionId,
          id,
        })
        .first();

      return {
        transaction,
      };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transaction")
        .where("sessions_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return {
        summary,
      };
    }
  );

  app.post("/", async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const body = createTransactionSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: true,
      });
    }

    await knex("transaction").insert({
      id: randomUUID(),
      title: body.title,
      amount: body.type === "credit" ? body.amount : body.amount * -1,
      sessions_id: sessionId,
    });

    return reply.status(201).send();
  });
}
