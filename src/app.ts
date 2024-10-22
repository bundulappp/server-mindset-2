import fastify, { FastifyRequest } from 'fastify';

export default function createApp(options = {}) {
  const app = fastify(options);

  app.get('/api/hello', (request, reply) => {
    reply.send({ hello: 'World!' });
  });

  type BrewSomethingHotParamsType = {
    Params: {
      drink: 'coffee' | 'tea' | 'chai';
    };
  };
  app.post<BrewSomethingHotParamsType>(
    '/api/beverages/:drink',
    (request, reply) => {
      const { drink } = request.params;

      reply.send({ drink });
    }
  );

  type MakeSomethingSoftSweetType = {
    Params: {
      drink: 'coffe' | 'tea' | 'chai';
    };
    Querystring?: {
      milk: 'yes';
      sugar: 'yes';
    };
  };

  app.post<MakeSomethingSoftSweetType>(
    '/api/beverages/:drink',
    (request, reply) => {
      const { drink } = request.params;
      const extras = [];

      if (request.query && 'milk' in request.query) {
        extras.push('milk');
      }

      if (request.query && 'sugar' in request.query) {
        extras.push('sugar');
      }

      reply.send({ drink, with: extras });
    }
  );

  app;

  return app;
}

// ## Task 5: Make it soft and sweet

// - Extend the `POST /api/beverages/<drink>` (`<drink>` can be coffee, tea or chai) endpoint with a query string. `milk=<yes or no>&sugar=<yes or no>`.
// - The query params are optional. If some of them missing it is considered as "no".
// - Extend the reply's body with a `with: []` prop. This array should contains the `'milk'` string if the milk query param was `yes` and similarly the `'sugar'` if the sugar param was `yes`.
// - Example: `POST /api/beverages/tea?sugar=yes` should respond with the following body in JSON format: `{drink: 'tea', with: ['sugar'] }`.
// - To test this task issue: `npm test -- task5`
