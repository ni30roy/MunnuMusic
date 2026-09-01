import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Defense-in-depth alongside proxy.ts: any Server Component that needs the
// current user calls this instead of trusting a non-null assertion on
// auth()'s result.
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}
