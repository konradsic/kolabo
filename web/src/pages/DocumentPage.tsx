import { useEffect, useState, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowLeft,
	Trash,
	TextB,
	TextItalic,
	TextUnderline,
	ListDashes,
	ListNumbers,
	TextAlignLeft,
	TextAlignCenter,
	TextAlignRight,
} from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import AccountPopover from "@/components/user-popover";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/theme-toggle";
import { CRDTInstance, type CrdtOp, type InsertOp, type DeleteOp } from "@/lib/crdt";
import useWebSocketRaw, { ReadyState } from "react-use-websocket";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useWebSocket = (useWebSocketRaw as any).default ?? useWebSocketRaw;

interface Invite {
	userId: string;
	email: string;
	role: string;
}

interface Document {
	id: string;
	title: string;
	createdAt: string;
	owner: {
		id: string;
		email: string;
	};
}

export default function DocumentPage() {
	const { id } = useParams<{ id: string }>();
	const { loading, authenticated, user } = useAuth();
	const [docData, setDocData] = useState<Document | null>(null);
	const [invites, setInvites] = useState<Invite[]>([]);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("VIEW");
	const [inviteError, setInviteError] = useState<string | null>(null);
	const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
	const apiUrl = import.meta.env.VITE_API_URL;
	const wsUrl = import.meta.env.VITE_WS_URL;
	const editorRef = useRef<HTMLDivElement | null>(null);
	const crdtRef = useRef<CRDTInstance | null>(null);
	const lastTextRef = useRef<string>("");
	const pendingOps = useRef<CrdtOp[]>([]);

	const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
		`${wsUrl}/document/${id}`,
		{
			shouldReconnect: () => true,
			share: false,
		},	
	);

	useEffect(() => {
		const fetchDocument = async () => {
			if (!id) return;
			try {
				const res = await fetch(`${apiUrl}/documents/${id}`, {
					credentials: "include",
				});
				if (res.ok) {
					const json = await res.json();
					setDocData(json.data || json);
				}
			} catch (error) {
				console.error("Failed to fetch document", error);
			}
		};

		const fetchInvites = async () => {
			if (!id) return;
			try {
				const res = await fetch(`${apiUrl}/documents/${id}/invites`, {
					credentials: "include",
				});
				if (res.ok) {
					const json = await res.json();
					if (json.data && Array.isArray(json.data.invites)) {
						setInvites(json.data.invites);
					} else if (Array.isArray(json)) {
						setInvites(json);
					} else {
						setInvites([]);
					}
				}
			} catch (error) {
				console.error("Failed to fetch invites", error);
			}
		};

		if (authenticated && id) {
			fetchDocument();
			fetchInvites();
			crdtRef.current = new CRDTInstance(32, user?.id || "unknown");
            console.log("CRDT init completed");
		}
	}, [authenticated, id, apiUrl]);

	const insertCharDOM = (op: InsertOp) => {
		if (docData == null) return;
		const el = editorRef.current!;

		el.normalize();
		const textNode =
			(el.firstChild as Text) ?? el.appendChild(document.createTextNode(""));

		const index = crdtRef.current!.getRelativeIndex(op.charId);
		if (index === -1) return;

		try {
			textNode.insertData(index, op.value);
		} catch (e) {
			el.textContent = crdtRef.current!.extractText();
            console.error("Failed to insert char DOM, resetting text content", e);
		}
	};

	const deleteCharDOM = (op: DeleteOp) => {
		if (docData == null) return;
		const el = editorRef.current!;

		el.normalize();
		const textNode = el.firstChild as Text;
		if (!textNode) return;

		const index = crdtRef.current!.getRelativeIndex(op.charId);
		if (index === -1) return;

		try {
			textNode.deleteData(index, 1);
		} catch {
			el.textContent = crdtRef.current!.extractText();
		}
	};

    const applyRemoteOp = (op: CrdtOp, updateText = true) => {
		const crdt = crdtRef.current;
		const el = editorRef.current;
		if (!crdt || !el) return;

		crdt.apply(op);

		if (op.type === "insert") {
			insertCharDOM(op);
		}

		if (op.type === "delete") {
			deleteCharDOM(op);
		}

		if (updateText) {
			lastTextRef.current = crdt.extractText();
		}
	};

	useEffect(() => {
		if (readyState === ReadyState.OPEN) {
			console.log("Connected to document WS");
		} else if (readyState === ReadyState.CLOSED) {
			console.log("WS Disconnected");
		}
	}, [readyState]);

	useEffect(() => {
		if (lastJsonMessage) {
			const handleMessage = async () => {
				try {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const data = lastJsonMessage as any;

					if (Array.isArray(data)) {
						for (let i = 0; i < data.length; i++) {
							const op = data[i];
							if (op.type === "insert" || op.type === "delete") {
								applyRemoteOp(op, true);
								await new Promise((resolve) =>
									requestAnimationFrame(() => resolve(undefined)),
								);
							}
						}
					} else if (
						data.type === "currentUsers" &&
						Array.isArray(data.users)
					) {
						setActiveUserIds(new Set(data.users));
					} else if (data.type === "userEvent") {
						if (data.action === "join") {
							setActiveUserIds((prev) => {
								const next = new Set(prev);
								next.add(data.userId);
								return next;
							});
						} else if (data.action === "leave") {
							setActiveUserIds((prev) => {
								const next = new Set(prev);
								next.delete(data.userId);
								return next;
							});
						}
					} else if (data.type === "insert" || data.type === "delete") {
						applyRemoteOp(data);
					}
				} catch (e) {
					console.error("Failed to parse WS message", e);
				}
			};
			handleMessage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastJsonMessage]);

	useEffect(() => {
		// Batch sender
		const interval = setInterval(() => {
			if (pendingOps.current.length > 0 && readyState === ReadyState.OPEN) {
				for (const op of pendingOps.current) sendJsonMessage(op);
				pendingOps.current = [];
			}
		}, 200);

		return () => {
			clearInterval(interval);
		};
	}, [readyState, sendJsonMessage]);

	const handleInvite = async () => {
		setInviteError(null);
		if (!id || !newMemberEmail) return;
		try {
			const res = await fetch(`${apiUrl}/documents/${id}/invite`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
				credentials: "include",
			});
			if (res.ok) {
				const json = await res.json();
				if (
					json.data.currentMembers &&
					Array.isArray(json.data.currentMembers)
				) {
					setInvites(json.data.currentMembers);
				}
				setNewMemberEmail("");
			} else {
				const json = await res.json();
				if (json.error) {
					setInviteError(json.error);
				} else {
					setInviteError("Failed to invite member");
				}
			}
		} catch (e) {
			console.error("Failed to invite", e);
			setInviteError("Network error occurred");
		}
	};

	const handleUpdateRole = async (userId: string, newRole: string) => {
		if (!id) return;
		try {
			const res = await fetch(
				`${apiUrl}/documents/${id}/invite/${userId}/${newRole}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				},
			);
			if (res.ok) {
				setInvites(
					invites.map((inv) =>
						inv.userId === userId ? { ...inv, role: newRole } : inv,
					),
				);
			}
		} catch (e) {
			console.error("Failed to update role", e);
		}
	};

	const handleRemoveMember = async (userId: string) => {
		if (!id) return;
		try {
			const res = await fetch(`${apiUrl}/documents/${id}/invite/${userId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (res.ok) {
				setInvites(invites.filter((inv) => inv.userId !== userId));
			}
		} catch (e) {
			console.error("Failed to remove member", e);
		}
	};

	const getActiveUsers = () => {
		const active = [];
		// Check owner
		if (docData?.owner && activeUserIds.has(docData.owner.id)) {
			active.push({ ...docData.owner, isOwner: true });
		}
		// Check invites
		invites.forEach((inv) => {
			if (activeUserIds.has(inv.userId)) {
				active.push({ id: inv.userId, email: inv.email, isOwner: false });
			}
		});
		// Self
		if (user && activeUserIds.has(user.id)) {
			if (!active.some((u) => u.id === user.id)) {
				active.push({ id: user.id, email: user.email, isOwner: false });
			}
		}
		return active;
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (docData === null) return;
			document.execCommand("insertText", false, "\n");
		}
	};

	const handleInput = () => {
		const el = editorRef.current;
		const crdt = crdtRef.current;
		if (!el || !crdt) return;

		const text = el.textContent ?? "";
		const prev = lastTextRef.current;

		if (text === prev) return;

		lastTextRef.current = text;

		const ops = diffToOps(prev, text, crdt);
		ops.forEach((op) => {
			crdt.apply(op);
			pendingOps.current.push(op);
		});
	};

	const diffToOps = (
		prev: string,
		next: string,
		crdt: CRDTInstance,
	): CrdtOp[] => {
		let start = 0;
		while (
			start < prev.length &&
			start < next.length &&
			prev[start] === next[start]
		)
			start++;

		let endOld = prev.length - 1;
		let endNew = next.length - 1;
		while (
			endOld >= start &&
			endNew >= start &&
			prev[endOld] === next[endNew]
		) {
			endOld--;
			endNew--;
		}

		const ops: CrdtOp[] = [];

		// deletes
		for (let i = endOld; i >= start; i--) {
			const char = crdt.getOrderedCharacters()[i];
			if (char) ops.push({ type: "delete", charId: char.id });
		}

		// inserts
		for (let i = start; i <= endNew; i++) {
			const prevPos = crdt.getOrderedCharacters()[i - 1]?.position ?? null;
			const nextPos = crdt.getOrderedCharacters()[i]?.position ?? null;

			const pos = crdt.generateBetween(prevPos, nextPos);
			ops.push({
				type: "insert",
				charId: crypto.randomUUID(),
				value: next[i],
				position: pos,
			});
		}

		return ops;
	};

	if (loading) return <Skeleton className="h-full w-full" />;
	if (!authenticated) return <Navigate to="/login" replace />;

	const activeUsersList = getActiveUsers();

	return (
		<div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
			{/* Main Content Area */}
			<div className="flex-1 flex flex-col relative min-w-0">
				{/* Top Navigation Bar */}
				<header className="h-16 border-b flex items-center justify-between px-8 bg-background/95 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
					<div className="flex items-center gap-4">
						<Link to="/dashboard">
							<Button
								variant="ghost"
								size="icon"
								className="h-10 w-10 hover:bg-muted rounded-none"
								title="Back to Dashboard"
							>
								<ArrowLeft size={20} />
							</Button>
						</Link>
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
								Document
							</span>
							<h1
								className="text-lg font-semibold leading-none truncate max-w-md"
								title={docData?.title}
							>
								{docData?.title || "Untitled"}
							</h1>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextB size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextItalic size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextUnderline size={18} />
						</Button>
						<Separator orientation="vertical" className="h-5 mx-1" />
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextAlignLeft size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextAlignCenter size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<TextAlignRight size={18} />
						</Button>
						<Separator orientation="vertical" className="h-5 mx-1" />
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<ListDashes size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted rounded-none"
						>
							<ListNumbers size={18} />
						</Button>
					</div>

					<div className="flex items-center gap-4">
						{/* Active Users Avatars */}
						<div className="mr-2 hidden md:block">
							<AvatarGroup>
								{activeUsersList.map((u) => (
									<Avatar
										key={u.id}
										className="h-8 w-8 border-2 border-background ring-2 ring-background"
										title={u.email}
									>
										<AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium opacity-100">
											{u.email?.[0]?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								))}
								{activeUsersList.length === 0 && (
									<div className="text-xs text-muted-foreground italic mr-2">
										Offline
									</div>
								)}
							</AvatarGroup>
						</div>

						<div className="text-xs text-muted-foreground hidden lg:block">
							Last saved {new Date().toLocaleTimeString()}
						</div>
						<Separator orientation="vertical" className="h-6" />
						<ModeToggle />
						<AccountPopover />
					</div>
				</header>

				<main className="bg-zinc-100 py-10">
					<div className="mx-auto w-[816px] min-h-[1056px] bg-white shadow-lg px-20 py-24">
						<div
							ref={editorRef}
							contentEditable
							suppressContentEditableWarning
							className="flex-1 w-full cursor-text outline-none whitespace-pre-wrap break-words text-base leading-relaxed"
							onInput={handleInput}
							onKeyDown={handleKeyDown}
						></div>
					</div>
				</main>
			</div>

			{/* Right Sidebar - Collaboration & Meta */}
			<aside className="w-80 border-l bg-background flex flex-col z-20 shadow-xl shadow-black/5 transition-colors duration-300">
				<div className="p-6 border-b bg-muted/5">
					<h2 className="font-semibold mb-1">Collaboration</h2>
					<p className="text-xs text-muted-foreground">
						Manage access and members
					</p>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-6">
					{/* Invite Section */}
					<div className="space-y-3">
						<Label className="text-xs font-medium uppercase text-muted-foreground">
							Invite New Member
						</Label>
						<div className="flex flex-col gap-2">
							<Input
								placeholder="user@example.com"
								value={newMemberEmail}
								onChange={(e) => setNewMemberEmail(e.target.value)}
								className="h-9 rounded-none"
							/>
							<div className="flex gap-2">
								<Select value={newMemberRole} onValueChange={setNewMemberRole}>
									<SelectTrigger className="h-9 flex-1 rounded-none">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										<SelectItem value="VIEW">Viewer</SelectItem>
										<SelectItem value="EDIT">Editor</SelectItem>
									</SelectContent>
								</Select>
								<Button
									size="sm"
									onClick={handleInvite}
									className="h-9 px-4 rounded-none"
								>
									Invite
								</Button>
							</div>
							{inviteError && (
								<p className="text-xs text-destructive">{inviteError}</p>
							)}
						</div>
					</div>

					<Separator />

					{/* Members List */}
					<div className="space-y-3">
						<Label className="text-xs font-medium uppercase text-muted-foreground">
							Active Members ({invites.length + (docData?.owner ? 1 : 0)})
						</Label>

						<div className="space-y-3">
							{/* Owner */}
							{docData?.owner && (
								<div className="flex items-center justify-between group">
									<div className="flex items-center gap-2 overflow-hidden">
										<div className="relative">
											<Avatar className="h-8 w-8 border">
												<AvatarFallback className="text-xs bg-primary text-primary-foreground opacity-100">
													{docData.owner.email[0].toUpperCase()}
												</AvatarFallback>
											</Avatar>
											{activeUserIds.has(docData.owner.id) && (
												<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
											)}
										</div>
										<div className="flex flex-col truncate">
											<span className="text-sm font-medium truncate">
												{docData.owner.email}
											</span>
											<span className="text-[10px] text-muted-foreground">
												Owner
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Invites */}
							{invites.map((invite) => (
								<div
									key={invite.userId}
									className="flex flex-col gap-2 p-2 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
								>
									<div className="flex items-center gap-2 overflow-hidden">
										<div className="relative">
											<Avatar className="h-8 w-8 border">
												<AvatarFallback className="text-xs bg-muted text-muted-foreground opacity-100">
													{invite.email?.[0]?.toUpperCase() || "U"}
												</AvatarFallback>
											</Avatar>
											{activeUserIds.has(invite.userId) && (
												<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
											)}
										</div>
										<div className="flex flex-col truncate">
											<span className="text-sm font-medium truncate">
												{invite.email || invite.userId}
											</span>
											<span className="text-[10px] text-muted-foreground">
												ID: {invite.userId.substring(0, 8)}...
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2 pl-10">
										<Select
											value={invite.role}
											onValueChange={(val) =>
												handleUpdateRole(invite.userId, val)
											}
										>
											<SelectTrigger className="h-7 text-[10px] w-20 min-w-0 px-2 rounded-none">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												<SelectItem value="VIEW">Viewer</SelectItem>
												<SelectItem value="EDIT">Editor</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-none"
											onClick={() => handleRemoveMember(invite.userId)}
											title="Remove Member"
										>
											<Trash size={14} />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Bottom Meta */}
				<div className="p-4 border-t bg-muted/5 text-xs text-muted-foreground text-center">
					Created{" "}
					{docData?.createdAt
						? new Date(docData.createdAt).toLocaleDateString()
						: "..."}
				</div>
			</aside>
		</div>
	);
}
