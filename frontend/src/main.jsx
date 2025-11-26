import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import AppRouter from "./router/AppRouter";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
