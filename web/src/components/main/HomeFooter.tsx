export function HomeFooter() {
	return (
		<footer className="w-[calc(100%-2rem)] mx-auto md:max-w-5xl mb-4 border bg-background py-6 text-center text-sm text-muted-foreground">
			<div className="container mx-auto">
				<p>&copy; {new Date().getFullYear()} Kolabo. All rights reserved.</p>
			</div>
		</footer>
	);
}
