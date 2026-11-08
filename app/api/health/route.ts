import { connection } from "next/server";

// What the cluster's probes call. connection() makes the handler run per
// request; without it a GET handler is prerendered and the probe would only
// prove that a file exists (ADR-0004).
// https://nextjs.org/docs/app/api-reference/functions/connection
export async function GET() {
  await connection();
  return Response.json({ status: "ok" });
}
