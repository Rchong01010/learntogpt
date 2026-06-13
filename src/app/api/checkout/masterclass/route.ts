import { NextResponse } from "next/server";

// Masterclass decommissioned (2026-06-12): the $250 masterclass was cancelled
// from marketing and the Stripe webhook never had a fulfillment branch for
// product "masterclass" — anyone paying via a stale link would receive
// nothing. The route is preserved so old links get a clean 410 Gone instead
// of a 404/500, and so no checkout session can ever again be created for a
// product we don't fulfill. Reverting this file restores the prior checkout
// in one diff (git log has the original).

export async function GET() {
  return NextResponse.json(
    { error: "This program is no longer available" },
    { status: 410 }
  );
}
