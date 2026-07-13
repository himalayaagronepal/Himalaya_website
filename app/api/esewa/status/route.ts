import { NextResponse } from "next/server";
import { getEsewaStatusUrl, getEsewaMerchantCode } from "../../../../lib/esewa";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product_code = url.searchParams.get("product_code") || getEsewaMerchantCode();
  const total_amount = url.searchParams.get("total_amount") || undefined;
  const transaction_uuid = url.searchParams.get("transaction_uuid") || undefined;

  if (!product_code) {
    return NextResponse.json({ message: "product_code is required" }, { status: 400 });
  }
  if (!total_amount) {
    return NextResponse.json({ message: "total_amount is required" }, { status: 400 });
  }
  if (!transaction_uuid) {
    return NextResponse.json({ message: "transaction_uuid is required" }, { status: 400 });
  }

  const endpoint = getEsewaStatusUrl();
  const statusUrl = new URL(endpoint);
  statusUrl.searchParams.set("product_code", product_code);
  statusUrl.searchParams.set("total_amount", total_amount);
  statusUrl.searchParams.set("transaction_uuid", transaction_uuid);

  const res = await fetch(statusUrl.toString(), { method: "GET" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json({ message: "Unable to fetch eSewa status", error: data }, { status: 502 });
  }

  return NextResponse.json(data);
}
