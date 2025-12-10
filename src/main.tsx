import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SupabaseProvider } from "@/lib/supabase";

createRoot(document.getElementById("root")!).render(
	<SupabaseProvider>
		<App />
	</SupabaseProvider>,
);
