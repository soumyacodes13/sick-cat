export default function TopHeader({
  title,
  showBack,
  onBack,
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  onSearchClick,
  onHeartClick,
  onOptionsClick,
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 4px 18px", width: "100%",
    }}>
      {/* Left element: Back button or Avatar */}
      {showBack ? (
        <button
          onClick={onBack}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
            color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}
          title="Back"
        >
          ←
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            overflow: "hidden", border: "2px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
          }}>
            <img
              src={avatarUrl}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* Center Title (optional, e.g. for My Music) */}
      {title && (
        <h2 style={{
          margin: 0, fontSize: "1.1rem", fontWeight: 800,
          color: "#ffffff", letterSpacing: "-0.01em",
        }}>
          {title}
        </h2>
      )}

      {/* Right Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.07)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
            title="Search"
          >
            🔍
          </button>
        )}

        {onHeartClick && (
          <button
            onClick={onHeartClick}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.07)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}
            title="Favorites"
          >
            ♡
          </button>
        )}

        {onOptionsClick && (
          <button
            onClick={onOptionsClick}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.07)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
            title="More Options"
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
}
