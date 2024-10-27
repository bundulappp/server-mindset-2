import fastify, { FastifyRequest } from 'fastify';

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
    additionalProperties: false,
  };

  const bodyJsonSchema = {
    type: 'object',
    properties: {
      kind: { type: 'string' },
    },
    additionalProperties: false,
  };

  const responseSchema = {
    response: {
      default: {
        type: 'object',
        properties: {
          drinks: { type: 'string' },
          with: {
            type: 'array',
            maxItems: 2,
            items: { type: 'string' },
          },
        },
      },
    },
  };

  const schema = {
    body: bodyJsonSchema,
    querystring: queryStringJsonSchema,
    // response: responseSchema,
  };
  app.post<MakeSomethingSoftSweetType>(
    '/api/beverages/:drink',
    { schema },
    (request, reply) => {
      const { drink } = request.params;
      const acceptableDrinks = ['tea', 'chai', 'coffee'];
      const extras: string[] = [];

      if (
        request.query &&
        'milk' in request.query &&
        request.query['milk'] === 'yes'
      ) {
        if (
          request.headers &&
          'codecool-beverages-dietary' in request.headers &&
          request.headers['codecool-beverages-dietary'] ===
            'lactose-intolerance'
        ) {
          extras.push('lf-milk');
        } else if (
          request.headers &&
          'codecool-beverages-dietary' in request.headers &&
          request.headers['codecool-beverages-dietary'] === 'vegan'
        ) {
          extras.push('oat-milk');
        } else {
          extras.push('milk');
        }
      }

      if (
        request.query &&
        'sugar' in request.query &&
        request.query['sugar'] === 'yes'
      ) {
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
