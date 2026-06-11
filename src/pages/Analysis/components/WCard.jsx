export default function WCard({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid #edf2f7",
        overflow: "hidden",
        ...style
      }}
    >
      {children}
    </div>
  );
}