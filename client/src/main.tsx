import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom fonts and styles
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: 'Inter', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
