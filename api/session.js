import { getUserById, getUsersCollection, upsertUserProfile, verifyAuthHeader } from "./_lib/backend.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const decodedUser = await verifyAuthHeader(request);
    await upsertUserProfile(decodedUser);

    const usersCollection = await getUsersCollection();
    const userDocument = await getUserById(decodedUser.uid, {
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
      scores: 1,
    });

    response.status(200).json({ user: userDocument });
  } catch (error) {
    const statusCode = error?.message === "Missing authorization token." ? 401 : 500;
    response.status(statusCode).json({
      error: statusCode === 401 ? error.message : "Unable to register the signed-in user.",
    });
  }
}
