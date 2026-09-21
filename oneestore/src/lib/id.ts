/** Short ids for cart lines and orders. */
export function uid(prefix = ""): string {
  return (
    prefix +
    Date.now().toString(36).slice(-5) +
    Math.random().toString(36).slice(2, 6)
  );
}

/** ONEESTORE order numbers read as OS-4H29K — short enough to say on a call. */
export function orderNo(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)];
  return `OS-${s}`;
}
