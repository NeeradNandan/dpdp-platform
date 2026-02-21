import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/grievance/classifier";
import type { RequestType } from "@/lib/grievance/types";

const VALID_TYPES: RequestType[] = [
  "access", "correction", "erasure", "portability", "objection",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, request_type } = body;

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!request_type || !VALID_TYPES.includes(request_type)) {
      return NextResponse.json(
        { error: `request_type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    const result = classify(description, request_type);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
