import type { FastifyInstance } from "fastify";
import z from "zod";
import type { FastifyTypedInstance } from "./types";
import { randomUUID } from "node:crypto";

interface UserInterface {
  id: string,
  name: string,
  email: string,
}

const users: UserInterface[] = []

export async function routes(app: FastifyTypedInstance) {
  app.get('/users', {
    schema: {
      tags: ['users'],
      description: 'Show Users',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.string()
        }))
      }
    }
  }, async (request, reply) => {
    return reply.status(200).send(users)
  })

  app.post('/users', {
    schema: {
      tags: ['users'],
      description: 'Create a new User',
      body: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      response: {
        201: z.null().describe('User Created')
      }
    }
  }, async (request, reply) => {

    const {name, email} = request.body;

    users.push({
      id: randomUUID(),
      name,
      email
    })

    return reply.status(201).send()
  })

}