import mongoose from "mongoose";

declare global {
  // allow global mongoose var across hot-reloads in dev
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const globalAny: any = global;
globalAny._mongoose = globalAny._mongoose || { conn: null, promise: null };
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = globalAny._mongoose;

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      // recommended options
      bufferCommands: false,
    } as mongoose.ConnectOptions;
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Never cache a rejected connection promise. Otherwise a single transient failure
    // (an Atlas blip, or a wrong MONGODB_URI present only at boot) gets reused by every
    // later request and the process stays broken until a full restart. Clear it so the
    // next call reconnects fresh.
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

export default connectToDatabase;