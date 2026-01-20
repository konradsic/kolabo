import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Navigate, Link } from "react-router-dom";
import { PlusIcon, TrashIcon, FileTextIcon, UsersIcon } from "@phosphor-icons/react";
import AccountPopover from "@/components/user-popover";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Document {
	id: string;
	title: string;
	createdAt: string;
	linkAccessRole: null | "VIEW" | "EDIT";
	owner: {
		id: string;
		email: string;
	};
	owned: boolean;
}

export default function Dashboard() {
	const { loading, authenticated, user } = useAuth();
	const [documents, setDocuments] = useState<Document[]>([]);
	const [newDocTitle, setNewDocTitle] = useState("Untitled Document");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchDocuments = async () => {
			try {
				const res = await fetch(`${apiUrl}/documents`, {
					credentials: "include",
				});
				if (res.ok) {
					const json = await res.json();
					if (
						json.data &&
						json.data.documents &&
						Array.isArray(json.data.documents)
					) {
						setDocuments(json.data.documents);
					} else if (Array.isArray(json)) {
						setDocuments(json);
					} else {
						console.error("Unexpected API response structure:", json);
						setDocuments([]);
					}
				}
			} catch (error) {
				console.error("Failed to fetch documents", error);
			}
		};

		if (authenticated) {
			fetchDocuments();
		}
	}, [authenticated, apiUrl]);

	const handleCreateDocument = async () => {
		try {
			const res = await fetch(`${apiUrl}/documents`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: newDocTitle }),
				credentials: "include",
			});
			if (res.ok) {
				const json = await res.json();
				let newDoc = json.data || json;

				// Handle nested document property if present
				if (newDoc && newDoc.document) {
					newDoc = newDoc.document;
				}

				// Fallback for missing createdAt
				if (!newDoc.createdAt) {
					newDoc.createdAt = new Date().toISOString();
				}

				setDocuments([...documents, newDoc]);
				setIsCreateOpen(false);
				setNewDocTitle("Untitled Document");
			}
		} catch (error) {
			console.error("Failed to create document", error);
		}
	};

	const handleDeleteDocument = async (id: string) => {
		try {
			const res = await fetch(`${apiUrl}/documents/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (res.ok) {
				setDocuments(documents.filter((doc) => doc.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete document", error);
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return "Invalid Date";
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
	};

	if (loading) {
		return <Skeleton className="h-10 w-full" />;
	}
	if (!authenticated) return <Navigate to="/login" replace />;

	return (
		<>
			<nav className="fixed top-4 left-0 right-0 z-50 mx-4 md:mx-auto md:max-w-5xl border bg-background/80 px-6 py-3 backdrop-blur-md shadow-sm">
				<div className="flex items-center justify-between">
					<div className="text-xl font-bold tracking-tight">Kolabo</div>
					<div className="flex items-center gap-4">
						<AccountPopover />
					</div>
				</div>
			</nav>
			<div className="w-screen p-4 pt-24 md:mx-auto md:max-w-5xl">
				<div>Welcome, {user?.email}!</div>

				<div className="flex items-center justify-between mt-4">
					<h1 className="font-bold text-xl">Your documents</h1>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<PlusIcon className="mr-2" /> New Document
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Document</DialogTitle>
								<DialogDescription>
									Give your new document a title.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="title" className="text-right">
										Title
									</Label>
									<Input
										id="title"
										value={newDocTitle}
										onChange={(e) => setNewDocTitle(e.target.value)}
										className="col-span-3"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button onClick={handleCreateDocument}>
									<PlusIcon /> Create
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="mt-6 space-y-2">
					{Array.isArray(documents) &&
						documents.map((doc) => {
							const Icon = doc.owned ? FileTextIcon : UsersIcon;
							return (
								<div
									key={doc.id}
									className="flex items-center justify-between p-3 border hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<Icon size={24} className="text-muted-foreground" />
										<Link
											to={`/dashboard/${doc.id}`}
											className="font-medium hover:underline"
										>
											{doc.title}
										</Link>
										{!doc.owned && <span className="text-xs text-muted-foreground/90 italic">Author: {doc.owner.email}</span>}
									</div>
									<div className="flex items-center gap-4">
										<span className="text-sm text-muted-foreground">
											{formatDate(doc.createdAt)}
										</span>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
												>
													<TrashIcon size={18} />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Are you sure?</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. This will permanently
														delete the document "{doc.title}".
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDeleteDocument(doc.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
						)})}
					{(!documents || documents.length === 0) && (
						<div className="text-center text-muted-foreground py-8">
							No documents found. Create one to get started.
						</div>
					)}
				</div>
			</div>
		</>
	);
}
