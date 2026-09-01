import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import JamJoinClient from "@/components/Jam/JamJoinClient";

export default async function JamJoinPage(props: PageProps<"/jam/[code]">) {
  await requireSession();
  const { code } = await props.params;

  const jam = await prisma.jamSession.findUnique({ where: { code: code.toUpperCase() } });
  if (!jam) notFound();

  return <JamJoinClient code={jam.code} />;
}
