import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      app: "chile-adicto-hoteles",
      now: new Date().toISOString(),
      env: {
        vercelEnv: process.env.VERCEL_ENV || null,
        vercelUrl: process.env.VERCEL_URL || null,
        gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
        gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
        gitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
