import type { Document } from "@/lib/doc";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ListDashesIcon, ListNumbersIcon, TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon } from "@phosphor-icons/react";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarGroup } from "./ui/avatar";
import { ModeToggle } from "./theme-toggle";
import AccountPopover from "./user-popover";
import {AVATAR_COLORS} from "@/lib/avatar-colors";

interface DocumentNavbarProps {
  docData: Document | null;
  activeUsersList: {
    id: string;
    email: string;
    isOwner: boolean;
  }[];
  colorMapping: Record<string, number>;
}

const getAvatarColor = (index: number) => {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function DocumentNavbar({ docData, activeUsersList, colorMapping }: DocumentNavbarProps) {
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