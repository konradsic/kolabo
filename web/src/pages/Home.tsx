import { HomeNavbar } from "../components/main/HomeNavbar";
import { Hero } from "../components/main/Hero";
import { HomeFooter } from "../components/main/HomeFooter";

export default function Home() {
	return (
		<div className="relative min-h-screen flex flex-col">
			<HomeNavbar />
			<main className="flex-1">
				<Hero />
			</main>
			<HomeFooter />
		</div>
	);
}
