import { NextResponse } from "next/server";
import { TEMPLATE_TYPES } from "@/lib/grievance/responder";

export async function GET() {
  return NextResponse.json({
    available_types: TEMPLATE_TYPES,
    templates: TEMPLATE_TYPES,
  });
}
