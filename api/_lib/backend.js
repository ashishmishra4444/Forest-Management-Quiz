import admin from "firebase-admin";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || "forest_quiz";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI for API runtime.");
}

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error("Missing Firebase Admin environment variables for API runtime.");
}

function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

getFirebaseAdminApp();

const mongoClient = new MongoClient(mongoUri);
let clientPromise = null;

async function getDatabase() {
  if (!clientPromise) {
    clientPromise = mongoClient.connect();
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(mongoDbName);
}

export async function getUsersCollection() {
  const database = await getDatabase();
  const usersCollection = database.collection("users");
  await usersCollection.createIndex({ userId: 1 }, { unique: true });
  return usersCollection;
}

export async function verifyAuthHeader(request) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    throw new Error("Missing authorization token.");
  }

  return admin.auth().verifyIdToken(token);
}

export async function upsertUserProfile(decodedUser) {
  const usersCollection = await getUsersCollection();
  const now = new Date();

  await usersCollection.updateOne(
    { userId: decodedUser.uid },
    {
      $set: {
        userId: decodedUser.uid,
        email: decodedUser.email ?? "",
        displayName: decodedUser.name ?? decodedUser.email ?? "Quiz User",
        photoURL: decodedUser.picture ?? "",
        emailVerified: Boolean(decodedUser.email_verified),
        provider: decodedUser.firebase?.sign_in_provider ?? "google.com",
        lastLoginAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
      $inc: {
        loginCount: 1,
      },
    },
    { upsert: true },
  );
}
