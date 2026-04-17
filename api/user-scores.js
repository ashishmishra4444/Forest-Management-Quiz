import { getUserById, saveUserBestScore, upsertUserProfile, verifyAuthHeader } from "./_lib/backend.js";

export default async function handler(request, response) {
  try {
    const decodedUser = await verifyAuthHeader(request);

    if (request.method === "GET") {
      const userDocument = await getUserById(decodedUser.uid, { _id: 0, scores: 1 });
      response.status(200).json({ scores: userDocument?.scores ?? {} });
      return;
    }

    if (request.method === "PUT") {
      const weekId = String(request.body?.weekId ?? "");
      const score = Number(request.body?.score ?? 0);
      const total = Number(request.body?.total ?? 0);

      if (!weekId || !Number.isFinite(score) || !Number.isFinite(total)) {
        response.status(400).json({ error: "weekId, score, and total are required." });
        return;
      }

      await upsertUserProfile(decodedUser);

      const userDocument = await getUserById(decodedUser.uid, { _id: 0, [`scores.${weekId}`]: 1 });
      const previousScore = userDocument?.scores?.[weekId];

      if (previousScore && Number(previousScore.score ?? 0) >= score) {
        response.status(200).json({ saved: false, score: previousScore });
        return;
      }

      const nextScore = {
        score,
        total,
        updatedAt: new Date(),
      };

      await saveUserBestScore(decodedUser.uid, weekId, nextScore);
      response.status(200).json({ saved: true, score: nextScore });
      return;
    }

    response.setHeader("Allow", "GET, PUT");
    response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    const statusCode = error?.message === "Missing authorization token." ? 401 : 500;
    response.status(statusCode).json({
      error: statusCode === 401 ? error.message : "Unable to sync user scores.",
    });
  }
}
