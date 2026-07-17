/** Pulsing placeholder bars shown while AI text loads. */
export function SkeletonLines({
  widths,
  height = 14,
}: {
  widths: (string | undefined)[];
  height?: number;
}) {
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: height / 2,
            background: "rgba(22,34,46,.08)",
            width: w,
            animation: `bePulse 1.2s ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
