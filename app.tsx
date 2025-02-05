// File: App.tsx
import React from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import AddressBook from "./components/AddressBook";

function App() {
  return <AddressBook />;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
