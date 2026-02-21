import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/grievance/classifier";
import type { RequestType } from "@/lib/grievance/types";

const VALID_TYPES: RequestType[] = [
  "access", "correction", "erasure", "portability", "objection",
];

interface BulkItem {
  description: string;
  stated_type?: RequestType;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    if (items.length > 100) {
      return NextResponse.json({ error: "Maximum 100 items per request" }, { status: 400 });
    }

    const classifications = (items as BulkItem[]).map((item) => {
      const statedType = VALID_TYPES.includes(item.stated_type as RequestType)
        ? (item.stated_type as RequestType)
        : "access";
      return classify(item.description ?? "", statedType);
    });

    return NextResponse.json({ classifications });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
