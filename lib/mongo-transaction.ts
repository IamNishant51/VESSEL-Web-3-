/**
 * MongoDB transaction helper
 * Wraps critical multi-step writes in a session when the database supports transactions.
 */

import mongoose, { ClientSession } from "mongoose";
import { connectToDatabase, isMongoDBConnected } from "@/lib/mongodb";

function isTransactionSupported(): boolean {
  return Boolean(process.env.MONGODB_URI) && isMongoDBConnected();
}

export async function withMongoTransaction<T>(
  operation: (session?: ClientSession) => Promise<T>
): Promise<T> {
  await connectToDatabase();

  if (!isTransactionSupported()) {
    return operation(undefined);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {
      // Ignore abort errors so the original failure is preserved.
    }
    throw error;
  } finally {
    session.endSession();
  }
}
