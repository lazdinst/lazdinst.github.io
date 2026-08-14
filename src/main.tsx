import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./app/App";
import store from "./redux/store";
import { ThemeProvider } from "./theme";
import "./theme/styles/index.css";

const mode = store.getState().theme.mode;
document.documentElement.classList.toggle("dark", mode === "dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
