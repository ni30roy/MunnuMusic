"use server";

import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

function generateCode(length = 5) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createJam(): Promise<string> {
  const userId = await requireUserId();

  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await prisma.jamSession.findUnique({ where: { code } });
    if (!clash) break;
    code = generateCode();
  }

  const jam = await prisma.jamSession.create({
    data: {
      code,
      createdById: userId,
      participants: { create: { userId } },
    },
  });

  return jam.code;
}

export async function joinJam(code: string): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();

  const jam = await prisma.jamSession.findUnique({ where: { code: code.toUpperCase() } });
  if (!jam) return { ok: false, error: "That jam code doesn't exist." };

  await prisma.jamParticipant.upsert({
    where: { sessionId_userId: { sessionId: jam.id, userId } },
    update: {},
    create: { sessionId: jam.id, userId },
  });

  return { ok: true };
}

export async function leaveJam(code: string) {
  const userId = await requireUserId();

  const jam = await prisma.jamSession.findUnique({ where: { code: code.toUpperCase() } });
  if (!jam) return;

  await prisma.jamParticipant.deleteMany({ where: { sessionId: jam.id, userId } });

  const remaining = await prisma.jamParticipant.count({ where: { sessionId: jam.id } });
  if (remaining === 0) {
    await prisma.jamSession.delete({ where: { id: jam.id } });
  }
}
