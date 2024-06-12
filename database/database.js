const { Sequelize } = require("sequelize");
const mongodb = require("mongodb");
const { connect } = require("mongoose");
const { config } = require("dotenv");

config();
const environment = process.env.NODE;

const onlineConnectionString = process.env.DATABASE_CONNECTION;
const devConnectionString = process.env.DATABASE_DEVELOPMENT_CONNECTION;

const connectionString =
  environment === "DEVELOPMENT" ? devConnectionString : onlineConnectionString;

const connectToMongodb = async () => {
  if (environment === "DEVELOPMENT") {
    return connect("mongodb://localhost:27017/shop");
  }

  console.log("Reached here", onlineConnectionString);

  return connect(
    "mongodb+srv://sunny:DOBbenobftIwJ7T1@cluster0.uwd0zm5.mongodb.net/shop?retryWrites=true&w=majority"
  );
};

module.exports.connectToMongodb = connectToMongodb;
module.exports.connectionString = connectionString;
