import { fastify, FastifyReply, FastifyRequest, FastifySchema } from 'fastify';

import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';

const server = fastify().withTypeProvider<JsonSchemaToTsProvider>();

export default function createApp(options = {}) {
  const app = fastify(options);

  app.get('/api/hello', (request, reply) => {
    reply.send({ hello: 'World!' });
  });

  type MakeSomethingSoftSweetType = {
    Params: {
      drink: 'coffe' | 'tea' | 'chai';
    };
    Querystring?: {
      milk?: 'yes';
      sugar?: 'yes';
    };
    Body?: {
      kind: string;
    };
    Headers?: {
      'CodeCool-Beverages-Dietary'?: 'lactose-intolerance' | 'vegan';
    };
  };

  const queryStringJsonSchema = {
    type: 'object',
    properties: {
      milk: { type: 'string' },
      sugar: { type: 'string' },
    },
  };

  const responseSchema = {
    201: {
      type: 'object',
      properties: {
        drink: { type: 'string' },
        with: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 2,
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
    },
    418: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
    },
  };

  const paramsSchema = {
    type: 'object',
    properties: {
      drink: { enum: ['tea', 'coffee', 'chai'] },
    },
    required: ['drink'],
    additionalProperties: false,
  };

  const headersJsonSchema = {
    type: 'object',
    properties: {
      'codecool-beverages-dietary': { enum: ['vegan', 'lactose-intolerance'] },
    },
  };

  const schema: FastifySchema = {
    params: paramsSchema,
    querystring: queryStringJsonSchema,
    headers: headersJsonSchema,
    response: responseSchema,
  };

  type ParamsType = { drink: string };
  type QueryType = { milk: string; sugar: string };
  type BodyType = { kind: string };

  app.post(
    '/api/beverages/:drink',
    {
      schema,
    },
    (
      request: FastifyRequest<{
        Params: ParamsType;
        Querystring: QueryType;
        Body: BodyType;
      }>,
      reply
    ) => {
      const { drink } = request.params;
      const acceptableDrinks = ['tea', 'chai', 'coffee'];
      const extras: string[] = [];

      if (request.query.milk === 'yes') {
        if (
          request.headers &&
          request.headers['codecool-beverages-dietary'] ===
            'lactose-intolerance'
        ) {
          extras.push('lf-milk');
        } else if (
          request.headers &&
          request.headers['codecool-beverages-dietary'] === 'vegan'
        ) {
          extras.push('oat-milk');
        } else {
          extras.push('milk');
        }
      }

      if (request.query.sugar === 'yes') {
        extras.push('sugar');
      }

      if (request.body) {
        const { kind } = request.body;
        reply.code(201).send({ drink: `${kind} ` + drink, with: extras });
      } else {
        if (
          drink !== 'tea' &&
          drink !== 'chai' &&
          acceptableDrinks.includes(drink)
        ) {
          return reply.code(418).send({ drink, with: extras });
        } else if (!acceptableDrinks.includes(drink)) {
          return reply.code(400).send({ reason: 'bad drink' });
        } else {
          return reply.code(201).send({ drink, with: extras });
        }
      }
    }
  );

  app;

  return app;
}
