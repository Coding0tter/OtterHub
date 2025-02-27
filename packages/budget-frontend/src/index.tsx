import { render } from "solid-js/web";

import "components/global.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./components/dashboard";
import { AccountSettings } from "./components/account-settings";
import { MonthlySettings } from "./components/monthly-settings";
import { Stats } from "./components/stats";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/budget" component={Dashboard} />
      <Route path="/budget/settings" component={AccountSettings} />
      <Route path="/budget/monthly" component={MonthlySettings} />
      <Route path="/budget/stats" component={Stats} />
    </Router>
  ),
  root!,
);
