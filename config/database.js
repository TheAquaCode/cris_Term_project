// Singleton pattern for database access
const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = null;
    Database.instance = this;
  }

  async connect() {
    if (this.connection) {
      console.log('Database: reusing existing connection');
      return this.connection;
    }
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Database: new connection established to MongoDB');
      return this.connection;
    } catch (err) {
      console.error('Database connection error:', err);
      process.exit(1);
    }
  }

  static getInstance() {
    if (!Database.instance) {
      new Database();
    }
    return Database.instance;
  }
}

module.exports = Database;
