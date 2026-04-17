import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import admin from "firebase-admin";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import path from "path";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

dotenv.config({ path: path.join(currentDir, ".env") });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || "forest_quiz";
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI. Add it to your server environment before starting the API.");
}

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error("Missing Firebase Admin environment variables for backend token verification.");
}

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
});

const mongoClient = new MongoClient(mongoUri);
await mongoClient.connect();

const database = mongoClient.db(mongoDbName);
const usersCollection = database.collection("users");
await usersCollection.createIndex({ userId: 1 }, { unique: true });

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json());

async function verifyAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    response.status(401).json({ error: "Missing authorization token." });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    request.user = decodedToken;
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired authorization token." });
  }
}

async function upsertUserProfile(decodedUser) {
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

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/session", verifyAuth, async (request, response) => {
  await upsertUserProfile(request.user);

  const userDocument = await usersCollection.findOne(
    { userId: request.user.uid },
    {
      projection: {
        _id: 0,
        userId: 1,
        email: 1,
        displayName: 1,
        photoURL: 1,
        emailVerified: 1,
        provider: 1,
        loginCount: 1,
        createdAt: 1,
        lastLoginAt: 1,
      },
    },
  );

  response.json({ user: userDocument });
});

app.listen(port, () => {
  console.log(`Mongo API listening on http://localhost:${port}`);
});
