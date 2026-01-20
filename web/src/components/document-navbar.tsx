import type { Document } from "@/lib/doc";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ListDashesIcon, ListNumbersIcon, TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon } from "@phosphor-icons/react";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarGroup } from "./ui/avatar";
import { ModeToggle } from "./theme-toggle";
import AccountPopover from "./user-popover";
import {AVATAR_COLORS} from "@/lib/avatar-colors";
import { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";

interface DocumentNavbarProps {
  docData: Document | null;
  activeUsersList: {
    id: string;
    email: string;
    isOwner: boolean;
  }[];
  colorMapping: Record<string, number>;
  apiUrl: string;
}

const getAvatarColor = (index: number) => {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function DocumentNavbar({ docData, activeUsersList, colorMapping, apiUrl }: DocumentNavbarProps) {
  const [title, setTitle] = useState(docData?.title || "Untitled");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (docData?.title) {
      setTitle(docData.title);
    }
  }, [docData?.title]);

  const updateTitle = async (newTitle: string) => {
    if (!docData) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`${apiUrl}/documents/${docData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
        credentials: "include",
      });
      if (res.ok) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus("saving");

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
      updateTitle(newTitle);
    }, 1000);
  }

  const getStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return <span className="text-xs font-semibold text-yellow-600 ml-2">Saving...</span>;
      case "saved":
        return <span className="text-xs font-semibold text-green-600 ml-2">Saved</span>;
      case "error":
        return <span className="text-xs font-semibold text-red-600 ml-2">Error</span>;
      default:
        return null;
    }
  }

  return (
    <header className="h-16 border-b flex items-center justify-between px-8 bg-background/95 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-muted rounded-none"
            title="Back to Dashboard"
          >
            <ArrowLeftIcon size={20} />
          </Button>
        </Link>
        <div className="flex flex-col">
          <Input
            value={title}
            onChange={handleTitleChange}
            className="ps-2 text-lg! font-semibold leading-snug truncate max-w-md bg-transparent
                       border border-transparent
                       hover:border-input
                       focus:border-input
                       focus-visible:ring-0"
          />
        </div>
        {getStatusIndicator()}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextBIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextItalicIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextUnderlineIcon size={18} />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextAlignLeftIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextAlignCenterIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <TextAlignRightIcon size={18} />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <ListDashesIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted rounded-none"
        >
          <ListNumbersIcon size={18} />
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
                title={`${u.email}${u.isOwner ? " (Owner)" : ""}`}
                style={{
                  boxShadow: `0 0 0 2px ${getAvatarColor(colorMapping[u.id])}`
                }}
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
  )
}