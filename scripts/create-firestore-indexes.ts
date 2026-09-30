import { readFileSync } from "node:fs";
import { GoogleAuth } from "google-auth-library";

type IndexDefinition = { collectionGroup: string; queryScope: string; fields: Array<{ fieldPath: string; order?: string; arrayConfig?: string }> };
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ?? "/home/ubuntu/upload/sigla-1e1cf-firebase-adminsdk-fbsvc-0850f2f1d6.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
const projectId = serviceAccount.project_id;
const definitions = JSON.parse(readFileSync("firestore.indexes.json", "utf8")).indexes as IndexDefinition[];

function sameIndex(a: any, b: IndexDefinition) { const fields = (a.fields ?? []).filter((field: any) => field.fieldPath !== "__name__"); return (!a.queryScope || a.queryScope === b.queryScope) && JSON.stringify(fields) === JSON.stringify(b.fields); }
async function waitForOperation(client: any, name: string) { for (let attempt = 0; attempt < 30; attempt += 1) { const response = await client.request({ url: `https://firestore.googleapis.com/v1/${name}`, method: "GET" }); if (response.data.done) { if (response.data.error) throw new Error(response.data.error.message ?? "Firestore index operation failed"); return; } await new Promise((resolve) => setTimeout(resolve, 2000)); } throw new Error(`Timed out waiting for ${name}`); }

async function main() {
  const auth = new GoogleAuth({ credentials: serviceAccount, scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const client = await auth.getClient();
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`;
  const created: string[] = []; const existing: string[] = [];
  for (const definition of definitions) {
    const label = `${definition.collectionGroup}:${definition.fields.map((field) => field.fieldPath).join(",")}`;
    const list = await client.request<{ indexes?: any[] }>({ url: `${base}/collectionGroups/${definition.collectionGroup}/indexes`, method: "GET" });
    if ((list.data.indexes ?? []).some((index) => sameIndex(index, definition))) { existing.push(label); continue; }
    try { const response = await client.request<{ name?: string }>({ url: `${base}/collectionGroups/${definition.collectionGroup}/indexes`, method: "POST", data: { queryScope: definition.queryScope, fields: definition.fields } }); created.push(response.data.name ? `${label} [${response.data.name}]` : label); }
    catch (error: any) { if (error?.response?.status === 409) existing.push(label); else throw error; }
  }
  console.log(JSON.stringify({ projectId, created, alreadyPresent: existing }, null, 2));
}

void main().catch((error) => { console.error(error?.response?.data ?? error); process.exitCode = 1; });
