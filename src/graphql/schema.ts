import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLID } from "graphql";
import Book from "../models/Book";
import Users from "../models/User";


const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        profileImage: { type: GraphQLString }
    })
});

const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        caption: { type: GraphQLString },
        image: { type: GraphQLString },
        rating: { type: GraphQLString },
        user: { type: GraphQLString }
    })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    books: {
      type: new GraphQLList(BookType),
      async resolve() {
        return await Book.find(); // optionally use .populate("user") if needed
      }
    },
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      async resolve(_, args) {
        return await Book.findById(args.id);
      }
    }
  }
});


export const schema = new GraphQLSchema({
    query: RootQuery
});
