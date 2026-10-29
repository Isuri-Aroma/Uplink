// Short age like "45m", "5h", "3d"
export function age(from, to = new Date()) {
  const mins = Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}
