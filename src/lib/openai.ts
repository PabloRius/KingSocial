import prisma from "@/prisma";
import { OpenAI } from "openai";
import { getEventById } from "./store/event";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEventEmbedding(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) return;

  const text = `${event.title}. ${event.description}. Tags: ${event.tags.join(
    ", "
  )}`;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { embedding: embedding.data[0].embedding },
  });
}

export async function generateCommunityEmbedding(communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });
  if (!community) return;

  const text = `${community.name}. ${community.description}`;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  await prisma.community.update({
    where: { id: communityId },
    data: { embedding: embedding.data[0].embedding },
  });
}

export async function updateUserEmbedding(userId: string) {
  const [events, communities] = await Promise.all([
    prisma.event.findMany({
      where: { participants: { some: { userId } } },
      select: { embedding: true },
    }),
    prisma.community.findMany({
      where: { members: { some: { userId } } },
      select: { embedding: true },
    }),
  ]);

  const allEmbeddings = [
    ...events.map((e) => e.embedding),
    ...communities.map((c) => c.embedding),
  ].filter(Boolean) as number[][];

  if (!allEmbeddings.length) return;

  const avgVector = allEmbeddings[0].map(
    (_, i) =>
      allEmbeddings.reduce((sum, v) => sum + v[i], 0) / allEmbeddings.length
  );

  await prisma.user.update({
    where: { id: userId },
    data: { embedding: avgVector },
  });
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}
