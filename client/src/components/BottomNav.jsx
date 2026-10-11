export default function BottomNav({ activeTab, onChangeTab }) {
  const tabs = [
    {
      id: "discover",
      label: "Discover",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
        </svg>
      ),
    },
    {
      id: "library",
      label: "My Music",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      ),
    },
    {
      id: "search",
      label: "Search",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
    },
    {
      id: "mood",
      label: "Moods",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 50, display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 9999,
      background: "rgba(22, 17, 30, 0.88)", backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            title={tab.label}
            style={{
              width: 44, height: 44, borderRadius: "50%", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              background: isActive ? "#d2f83d" : "transparent",
              color: isActive ? "#000000" : "rgba(255, 255, 255, 0.55)",
              boxShadow: isActive ? "0 4px 14px rgba(210, 248, 61, 0.4)" : "none",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
          >
            {tab.icon}
          </button>
        );
      })}
    </div>
  );
}
