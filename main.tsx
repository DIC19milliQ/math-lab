import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CapacityApp from "./app/capacity-app";
import "./app/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Application root was not found");

createRoot(root).render(
  <StrictMode>
    <CapacityApp />
  </StrictMode>,
);
