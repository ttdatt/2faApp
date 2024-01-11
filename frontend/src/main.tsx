import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";

declare global {
	interface Window {
		runtime: any;
	}
}

const container = document.getElementById("root");

if (container) {
	const root = createRoot(container);

	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
