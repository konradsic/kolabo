import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function HomeNavbar() {
	return (
		<nav className="fixed top-4 left-0 right-0 z-50 mx-4 md:mx-auto md:max-w-5xl border bg-background/80 px-6 py-3 backdrop-blur-md shadow-sm">
			<div className="flex items-center justify-between">
				<div className="text-xl font-bold tracking-tight">Kolabo</div>
				<div className="flex items-center gap-4">
					<Link to="/login">
						<Button variant="ghost">Log in</Button>
					</Link>
					<Link to="/create-account">
						<Button>Get Started</Button>
					</Link>
				</div>
			</div>
		</nav>
	);
}
