import "./Header.css";

interface HeaderProps {
  onNewSession?: () => void;
}

export default function Header({ onNewSession }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">🐞</div>

        <div>
          <h1 className="title">BugRecall</h1>
          <p className="subtitle">
            Stateful AI Debugging Assistant
          </p>
        </div>
      </div>

      <button
        className="new-session-btn"
        onClick={onNewSession}
      >
        + New Session
      </button>
    </header>
  );
}