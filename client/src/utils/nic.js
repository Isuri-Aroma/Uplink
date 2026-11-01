// Sri Lankan NIC (same rules as the server)
const OLD = /^(\d{2})(\d{3})\d{3}\d[VX]$/;
const NEW = /^(\d{4})(\d{3})\d{4}\d$/;

export function readNic(input) {
  const nic = String(input || '').trim().toUpperCase();
  const m = nic.match(OLD) || nic.match(NEW);
  if (!m) return null;

  const year = m[1].length === 2 ? 1900 + Number(m[1]) : Number(m[1]);
  let day = Number(m[2]);
  const gender = day > 500 ? 'Female' : 'Male';
  if (day > 500) day -= 500;
  if (day < 1 || day > 366) return null;

  // NIC days count Feb as 29 days
  const ref = new Date(Date.UTC(2000, 0, day));
  const dob = new Date(Date.UTC(year, ref.getUTCMonth(), ref.getUTCDate()));

  // 29 Feb only exists in a leap year
  if (dob.getUTCMonth() !== ref.getUTCMonth()) return null;

  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() < dob.getUTCMonth() || (now.getMonth() === dob.getUTCMonth() && now.getDate() < dob.getUTCDate())) age -= 1;

  return { gender, dob, age };
}
