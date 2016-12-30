var express = require('express');
var bodyParser = require('body-parser');
var graphqlServer = require('graphql-server-express');
var graphqlTools = require('graphql-tools');

var typeDefs = `
  type Query {
    test: String
  }
`;

var resolvers = {};
var context = {};

var schema = graphqlTools.makeExecutableSchema({
  resolvers : resolvers,
  typeDefs : typeDefs,
});
graphqlTools.addMockFunctionsToSchema({
  schema: schema,
  mocks: {},
  preserveResolvers: true,
});

var app = express();
app.use('/graphiql', graphqlServer.graphiqlExpress({ endpointURL: '/graphql' }));
app.use('/graphql', bodyParser.json(), graphqlServer.graphqlExpress({
  schema: schema,
  context: context,
}));

app.listen(3000, () => {
  console.log('listening on port 3000');
});
