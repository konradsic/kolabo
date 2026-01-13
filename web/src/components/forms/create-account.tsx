import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SpinnerIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const schema = z
	.object({
		email: z.email(),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" }),
		passwordRepeat: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" }),
	})
	.superRefine(({ password, passwordRepeat }, ctx) => {
		if (password !== passwordRepeat) {
			ctx.addIssue({
				path: ["passwordRepeat"],
				code: "custom",
				message: "Passwords do not match",
			});
		}
	});

export function CreateAccountForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string | null>(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (data: { email: string; password: string }) => {
		setError(null);

		const res = await fetch(`${apiUrl}/users/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: data.email,
				password: data.password,
			}),
			credentials: "include",
		});

		if (res.ok) {
			// navigate to dashboard
			navigate("/login");
		} else {
			const resData = await res.json();
			setError(resData.error || "Error");
		}
	};
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome to Kolabo</CardTitle>
					<CardDescription>Create your account to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<Field>
								{error && (
									<p className="text-sm text-red-600 mb-2 text-center">
										{error}
									</p>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input {...register("email")} placeholder="m@example.com" />
								{errors.email && (
									<p className="text-sm text-red-600 mt-1">
										{errors.email.message}
									</p>
								)}
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
								</div>
								<Input {...register("password")} type="password" />
								{errors.password && (
									<p className="text-sm text-red-600 mt-1">
										{errors.password.message}
									</p>
								)}
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="passwordRepeat">
										Repeat password
									</FieldLabel>
								</div>
								<Input {...register("passwordRepeat")} type="password" />
								{errors.passwordRepeat && (
									<p className="text-sm text-red-600 mt-1">
										{errors.passwordRepeat.message}
									</p>
								)}
							</Field>
							<Field>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<SpinnerIcon className="animate-spin" /> Creating...
										</>
									) : (
										"Create Account"
									)}
								</Button>
								<FieldDescription className="text-center">
									Already have an account? <a href="/login">Log in</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking 'Create Account', you agree to our{" "}
				<a href="/tos">Terms of Service</a> and{" "}
				<a href="/privacy-policy">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
