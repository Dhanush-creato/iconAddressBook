// File: components/AddressBook.tsx
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";

interface Contact {
  id?: number;
  name: string;
  phone: string;
  address: string;
  dateInstalled: string;
}

const AddressBook = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Contact>({
    name: "",
    phone: "",
    address: "",
    dateInstalled: new Date().toISOString().split("T")[0],
  });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : data.rows || []);
      setError(null);
    } catch (err) {
      setError("Unable to load contacts. Please try again.");
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        fetchContacts();
        setNewContact({ name: "", phone: "", address: "", dateInstalled: new Date().toISOString().split("T")[0] });
      } else {
        throw new Error("Failed to add contact");
      }
    } catch {
      setError("Failed to add contact. Please try again.");
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      const response = await fetch(`/contacts/${editingContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingContact),
      });

      if (response.ok) {
        fetchContacts();
        setEditingContact(null);
      } else {
        throw new Error("Failed to edit contact");
      }
    } catch {
      setError("Failed to edit contact. Please try again.");
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/contacts/${id}`, { method: "DELETE" });
      if (response.ok) fetchContacts();
      else throw new Error("Failed to delete contact");
    } catch {
      setError("Failed to delete contact. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#333", borderBottom: "2px solid #4CAF50", paddingBottom: "10px" }}>
        ICON ADDRESS BOOK
      </h1>

      {error && <div style={{ backgroundColor: "#ffdddd", color: "#ff0000", padding: "10px", marginBottom: "15px", borderRadius: "5px", textAlign: "center" }}>{error}</div>}

      <form onSubmit={editingContact ? handleEditContact : handleAddContact} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px" }}>
        <input type="text" placeholder="Name" value={editingContact ? editingContact.name : newContact.name} onChange={(e) => editingContact ? setEditingContact({ ...editingContact, name: e.target.value }) : setNewContact({ ...newContact, name: e.target.value })} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }} />
        <input type="tel" placeholder="Phone Number" value={editingContact ? editingContact.phone : newContact.phone} onChange={(e) => editingContact ? setEditingContact({ ...editingContact, phone: e.target.value }) : setNewContact({ ...newContact, phone: e.target.value })} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }} />
        <input type="text" placeholder="Full Address" value={editingContact ? editingContact.address : newContact.address} onChange={(e) => editingContact ? setEditingContact({ ...editingContact, address: e.target.value }) : setNewContact({ ...newContact, address: e.target.value })} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }} />
        <input type="date" value={editingContact ? editingContact.dateInstalled : newContact.dateInstalled} onChange={(e) => editingContact ? setEditingContact({ ...editingContact, dateInstalled: e.target.value }) : setNewContact({ ...newContact, dateInstalled: e.target.value })} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }} />
        <button type="submit" style={{ padding: "10px", backgroundColor: editingContact ? "#FFA500" : "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {editingContact ? "🔄 Update Contact" : "➕ Add Contact"}
        </button>
        {editingContact && <button type="button" onClick={() => setEditingContact(null)} style={{ padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}>❌ Cancel Edit</button>}
      </form>

      <input type="text" placeholder="🔍 Search contacts (name, phone, address)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "15px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }} />

      <div style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", color: "#333" }}>Saved Contacts</h2>
        <p style={{ color: "#666", marginBottom: "10px", textAlign: "center", fontStyle: "italic" }}>{filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""} found</p>
        {filteredContacts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>No contacts match your search. Try again!</p>
        ) : (
          filteredContacts.map((contact) => (
            <div key={contact.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white" }}>
              <div>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{contact.name}</h3>
                <p style={{ margin: "5px 0" }}>📞 {contact.phone}</p>
                <p style={{ margin: "5px 0" }}>📍 {contact.address}</p>
                <p style={{ margin: "5px 0", color: "#666" }}>📅 Installed: {contact.dateInstalled}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={() => setEditingContact(contact)} style={{ backgroundColor: "green", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>✏ Edit</button>
                <button onClick={() => handleDeleteContact(contact.id!)} style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>🗑 Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
