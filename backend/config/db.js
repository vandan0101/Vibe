const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.warn(`Primary MongoDB connection failed: ${error.message}`);
        console.warn('Starting local in-memory MongoDB fallback...');

        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri('spotify-app');
        const conn = await mongoose.connect(memoryUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected: in-memory fallback');
        return conn;
    }
};

module.exports = connectDB;
