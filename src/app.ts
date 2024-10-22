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
  };

  app.post<MakeSomethingSoftSweetType>(
    '/api/beverages/:drink',
    (request, reply) => {
      const { drink } = request.params;
      const extras: string[] = [];

      if (
        request.query &&
        'milk' in request.query &&
        request.query['milk'] === 'yes'
      ) {
        extras.push('milk');
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
        reply.send({ drink: `${kind} ` + drink, with: extras });
      } else {
        reply.send({ drink, with: extras });
      }
    }
  );

  app;

  return app;
}
