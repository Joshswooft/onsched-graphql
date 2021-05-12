import * as express from 'express';
import { graphqlHTTP } from 'express-graphql';
import createSchema from 'swagger-to-graphql';
import { callBackend } from './proxy';

const app = express();
// https://sandbox-api.onsched.com/swagger/setup/swagger.json
const pathToSwaggerSchema = process.env.ONSCHED_CONSUMER_API_URL + "/swagger/setup/swagger.json";

createSchema({
  swaggerSchema: pathToSwaggerSchema,
  callBackend
})
  .then(schema => {
    app.use(
      '/graphql',
      graphqlHTTP(() => {
        return {
          schema,
          graphiql: true,
          customFormatErrorFn: (error) => ({
            message: error.message,
            locations: error.locations,
            stack: error.stack ? error.stack.split('\n') : [],
            path: error.path,
          }),
          context: {
          }
        };
      }),
    );
    app.listen(3009, 'localhost', () => {
      console.info('http://localhost:3009/graphql');
    });
  })
  .catch(e => {
    console.log(e);
  });