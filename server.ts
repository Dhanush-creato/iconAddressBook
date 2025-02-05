export default AddressBook;

// File: server.ts
export default async function server(request: Request): Promise<Response> {
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
  const KEY = new URL(import.meta.url).pathname.split("/").pop();
  const SCHEMA_VERSION = 2;

  await sqlite.execute(`CREATE TABLE IF NOT EXISTS ${KEY}contacts${SCHEMA_VERSION} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    dateInstalled TEXT NOT NULL
  )`);

  const urlPath = new URL(request.url).pathname;
  if (request.method === "GET" && urlPath === "/contacts") {
    const contacts = await sqlite.execute(`SELECT * FROM ${KEY}contacts${SCHEMA_VERSION} ORDER BY id DESC`);
    return new Response(JSON.stringify(contacts.rows), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (request.method === "POST" && urlPath === "/contacts") {
    const contact = await request.json();
    await sqlite.execute(`INSERT INTO ${KEY}contacts${SCHEMA_VERSION} (name, phone, address, dateInstalled) VALUES (?, ?, ?, ?)`, [contact.name, contact.phone, contact.address, contact.dateInstalled]);
    return new Response("Contact added", { status: 201 });
  }

  if (request.method === "PUT" && /\/contacts\/\d+/.test(urlPath)) {
    const id = urlPath.split("/").pop();
    const contact = await request.json();
    await sqlite.execute(`UPDATE ${KEY}contacts${SCHEMA_VERSION} SET name = ?, phone = ?, address = ?, dateInstalled = ? WHERE id = ?`, [contact.name, contact.phone, contact.address, contact.dateInstalled, id]);
    return new Response("Contact updated", { status: 200 });
  }

  if (request.method === "DELETE" && /\/contacts\/\d+/.test(urlPath)) {
    const id = urlPath.split("/").pop();
    await sqlite.execute(`DELETE FROM ${KEY}contacts${SCHEMA_VERSION} WHERE id = ?`, [id]);
    return new Response("Contact deleted", { status: 200 });
  }

  return new Response("Not Found", { status: 404 });
}
