export async function POST() {
  return Response.json({ error: "Use /api/stripe/create-payment-intent to book" }, { status: 400 });
}
