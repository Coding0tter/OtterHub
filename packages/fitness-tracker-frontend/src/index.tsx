import { render } from "solid-js/web";

import "components/global.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Dashboard from "./components/dashboard";
import { Profile } from "./components/profile";
import { WorkoutEditor } from "./components/workoutEditor";
import { ActiveWorkout } from "./components/active-workout";
import { WorkoutProgress } from "./components/workout-progress";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/fitness" component={Dashboard} />
      <Route path="/fitness/profile" component={Profile} />
      <Route path="/fitness/workout-editor/:id" component={WorkoutEditor} />
      <Route path="/fitness/active-workout/:id" component={ActiveWorkout} />
      <Route path="/fitness/workout-progress" component={WorkoutProgress} />
    </Router>
  ),
  root!,
);
