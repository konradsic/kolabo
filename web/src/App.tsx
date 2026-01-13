import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import DocumentPage from "./pages/DocumentPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/create-account" element={<CreateAccount />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/dashboard/:id" element={<DocumentPage />} />
		</Routes>
	);
}
