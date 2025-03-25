/* @refresh reload */
import { render } from "solid-js/web";

import "components/global.css";
import App from "./App";
import { ToastProvider } from "components";
import { Route, Router } from "@solidjs/router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <ToastProvider>
      <Router root={App}>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
      </Router>
    </ToastProvider>
  ),
  root!,
);
