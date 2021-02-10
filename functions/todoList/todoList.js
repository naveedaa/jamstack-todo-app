const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const query = faunadb.query;
require("dotenv").config();

const typeDefs = gql`
  type Query {
    todos: [TODO!]!
  }
  type Mutation {
    addTodo(task: String!): TODO!
    checkedTodo(id: ID!, done: Boolean): TODO
    deleteTodo(id: ID!): TODO
  }
  type TODO {
    id: ID!
    task: String!
    done: Boolean!
  }
`;

const resolvers = {
  Query: {
    todos: async (root, args, context) => {
      try {
        const client = await new faunadb.Client({
          secret: "fnAD_8LnICACAVH9brMi28SGbH8ZbHb8SM4KDSrA",
        });

        const result = await client.query(
          query.Map(
            query.Paginate(query.Match(query.Index("all_todos"))),
            query.Lambda("X", query.Get(query.Var("X")))
          )
        );
        console.log(
          "Result : ",
          result.data.map((d) => {
            return {
              id: d.ref.id,
              task: d.data.task,
              done: d.data.done,
            };
          })
        );
        return result.data.map((d) => {
          return {
            id: d.ref.id,
            task: d.data.task,
            done: d.data.done,
          };
        });
      } catch (error) {
        console.log("ERROR : ", error);
      }
    },
  },

  Mutation: {
    checkedTodo: async (_, { id, done }) => {
      try {
        const client = new faunadb.Client({
          secret: "fnAD_8LnICACAVH9brMi28SGbH8ZbHb8SM4KDSrA",
        });

        const data = await client.query(
          query.Update(query.Ref(query.Collection("Todos"), id), {
            data: { done: done },
          })
        );
        console.log("DATA : ", data);
        return {
          id: data.ref.id,
          task: data.data.task,
          done: data.data.done,
        };
      } catch (error) {
        console.log("Error : ", error);
      }
    },
    addTodo: async (_, { task }) => {
      try {
        const client = new faunadb.Client({
          secret: "fnAD_8LnICACAVH9brMi28SGbH8ZbHb8SM4KDSrA",
        });

        const data = await client.query(
          query.Create(query.Collection("Todos"), {
            data: { task: task, done: false },
          })
        );
        console.log("DATA : ", data);
        return {
          id: data.ref.id,
          task: data.data.task,
          done: data.data.done,
        };
      } catch (error) {
        console.log("Error : ", error);
      }
    },
    deleteTodo: async (_, { id }) => {
      try {
        const client = new faunadb.Client({
          secret: "fnAD_8LnICACAVH9brMi28SGbH8ZbHb8SM4KDSrA",
        });

        const data = await client.query(
          query.Delete(query.Ref(query.Collection("Todos"), id))
        );
        console.log("DATA : ", data);
        return {
          id: data.ref.id,
          task: data.data.task,
          done: data.data.done,
        };
      } catch (error) {
        console.log("Error : ", error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = server.createHandler();

module.exports = { handler };
