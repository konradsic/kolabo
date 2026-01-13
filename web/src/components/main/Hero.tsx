import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Hero() {
	return (
		<section className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12 text-center bg-background">
			<h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
				Collaborate seamlessly on documents <br className="hidden sm:block" />
				with your team.
			</h1>
			<p className="max-w-2xl text-lg text-muted-foreground mb-8">
				Kolabo brings your team together with intuitive shared document editing,
				live updates and collaborative features.
			</p>
			<div className="flex flex-col sm:flex-row gap-4">
				<Link to="/create-account">
					<Button size="lg" className="w-full sm:w-auto p-6 text-sm">
						Start for free
					</Button>
				</Link>
				<Link to="/login">
					<Button
						variant="outline"
						size="lg"
						className="w-full sm:w-auto p-6 text-sm"
					>
						Log in
					</Button>
				</Link>
			</div>
		</section>
	);
}
