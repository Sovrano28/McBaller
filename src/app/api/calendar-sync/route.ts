import { NextResponse } from "next/server";
import { getSession } from "@/lib/actions/auth";
import { createCalendarSync } from "@/lib/actions/calendar-sync";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.role === "player") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orgSession = session as any;
    if (!orgSession.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, accessToken, refreshToken, expiresAt, calendarId } = body;

    const result = await createCalendarSync(orgSession.organizationId, {
      provider,
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      calendarId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.sync);
  } catch (error: any) {
    console.error("Calendar sync API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

