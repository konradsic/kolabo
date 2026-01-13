import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { UserIcon, SignOutIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AccountPopover() {
	const apiUrl = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	async function logOut() {
		const res = await fetch(`${apiUrl}/users/logout`, {
			method: "POST",
			credentials: "include",
		});
		if (res.ok) navigate("/login");
	}

	return (
		<Popover>
			<PopoverTrigger>
				<Avatar>
					<AvatarFallback>
						<UserIcon />
					</AvatarFallback>
				</Avatar>
			</PopoverTrigger>
			<PopoverContent className="w-40 flex flex-col gap-2" align="end">
				<Link to="/dashboard" className="hover:underline">
					Dashboard
				</Link>
				<Link to="/dashboard" className="hover:underline">
					Account
				</Link>
				<Button variant="destructive" className="mt-2" onClick={logOut}>
					<SignOutIcon /> Log out
				</Button>
			</PopoverContent>
		</Popover>
	);
}
