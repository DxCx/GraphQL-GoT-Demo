var express = require('express');
var bodyParser = require('body-parser');
var graphqlServer = require('graphql-server-express');
var graphqlTools = require('graphql-tools');
var rp = require('request-promise');

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

var resolvers = {
  Query: {
    bookById: (root, args, ctx) => ctx.get("http://www.anapioficeandfire.com/api/books/" + args.bookId),
    bookByName: (root, args, ctx) => ctx.get("http://www.anapioficeandfire.com/api/books?name=" + args.bookName),
  },
  Book: {
    characters: (root, args, ctx) => root.characters.map((url) => ctx.get(url)),
  },
  Character: {
    allegiances: (root, args, ctx) => root.allegiances.map((url) => ctx.get(url)),
    father: (root, args, ctx) => ctx.get(root.father),
    mother: (root, args, ctx) => ctx.get(root.mother),
  },
  House: {
    swornMembers: (root, args, ctx) => root.swornMembers.map((url) => ctx.get(url)),
    currentLord: (root, args, ctx) => ctx.get(root.currentLord),
    heir: (root, args, ctx) => ctx.get(root.heir),
  }
};
var context = {
  get: (url) => {
      if ( url.length === 0 ) {
        return null;
      }

      return rp(url).then((res) => {
        return JSON.parse(res);
    });
  },
};

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
