import { NextResponse } from "next/server";
import { loadAll } from "@/lib/rgc-data";

export async function GET() {
  try {
    const { transcripts, products, brands } = loadAll();

    return NextResponse.json({
      transcriptCount: transcripts.length,
      productCount: products.length,
      brandCount: brands.length,
    });
  } catch (error) {
    console.error("Data load error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
