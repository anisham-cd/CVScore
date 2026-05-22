import dns from "node:dns";
import mongoose from "mongoose";

mongoose.set("strictQuery", false);

dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI: string = process.env.MONGODB_URI ?? (() => {
  throw new Error("Please define MONGODB_URI in .env.local");
})();

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithDnsFallback(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

async function connectWithDnsFallback(uri: string) {
  try {
    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  } catch (error: any) {
    if (error?.code === "ECONNREFUSED" && error?.syscall === "querySrv") {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.warn("MongoDB SRV lookup failed; retrying with public DNS servers.");
      return await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
    }
    throw error;
  }
}