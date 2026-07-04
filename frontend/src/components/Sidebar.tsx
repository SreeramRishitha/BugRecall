import { useMemo, useState } from "react";
import type { BugSession } from "../types";
import SidebarItem from "./SidebarItem";
import SearchBar from "./SearchBar";
import "./Sidebar.css";

interface Props {
  sessions: BugSession[];
}

export default function Sidebar({ sessions }: Props) {
  const [search, setSearch] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const text = (
        s.title +
        " " +
        s.project +
        " " +
        s.status
      ).toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [sessions, search]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>🐞 Bug Sessions</h3>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <button
    className="new-session-btn"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
>
    + New Session
</button>
      <div className="sidebar-list">
        {filteredSessions.length === 0 ? (
          <div className="empty-sidebar">
            No matching sessions
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SidebarItem
              key={session.id}
              session={session}
            />
          ))
        )}
      </div>
    </aside>
  );
}