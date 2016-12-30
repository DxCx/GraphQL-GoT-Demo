var express = require('express');
var bodyParser = require('body-parser');
var graphqlServer = require('graphql-server-express');
var graphqlTools = require('graphql-tools');

var typeDefs = `
  schema {
      query: Query
  }

  type Query {
      bookById(bookId: Int!): Book
      bookByName(bookName: String!): [Book]
  }

  type House {
      name: String
      region: String
      titles: [String]
      currentLord: Character
      heir: Character
      swornMembers: [Character]
  }

  type Character {
      name: String
      gender: String
      born: String
      father: Character
      mother: Character
      allegiances: [House]
  }

  type Book {
      name: String
      isban: String
      authors: [String]
      released: String
      characters: [Character]
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
