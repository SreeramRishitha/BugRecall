import { Link } from "react-router-dom";
import type { BugSession } from "../types";
import StatusPill from "./StatusPill";
import "./SidebarItem.css";

interface Props {
  session: BugSession;
}

export default function SidebarItem({ session }: Props) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="sidebar-item"
    >
      <div className="sidebar-item-title">
        🐞 {session.title}
      </div>

      <div className="sidebar-item-project">
        {session.project}
      </div>

      <div className="sidebar-item-footer">
        <StatusPill status={session.status} />
      </div>
    </Link>
  );
}