export function serialize(doc: any) {
  if (!doc) return doc;
  // JSON round-trip ensures mongoose/ObjectId/Date become plain JS values
  return JSON.parse(JSON.stringify(doc));
}

export function serializeMany(docs: any[]) {
  return docs.map((d) => serialize(d));
}

export default { serialize, serializeMany };