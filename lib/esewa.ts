import crypto from "crypto";

export function getEsewaMerchantCode() {
  return process.env.ESEWA_MERCHANT_CODE || process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "";
}

export function getEsewaFormUrl() {
  return process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
}

export function getEsewaStatusUrl() {
  return process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
}

export function getEsewaSecretKey() {
  return (process.env.ESEWA_SECRET_KEY || "").trim();
}

export function createEsewaSignature(total_amount: string, transaction_uuid: string, product_code: string, secret: string) {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const signature = crypto.createHmac("sha256", secret).update(message, "utf8").digest("base64");
  return { signature, signedFieldNames, message };
}
