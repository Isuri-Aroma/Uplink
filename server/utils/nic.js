// Sri Lankan NIC: old 901234567V, new 199012304567 (day +500 = female)

const OLD = /^(\d{2})(\d{3})(\d{3})(\d)[VX]$/;
const NEW = /^(\d{4})(\d{3})(\d{4})(\d)$/;

export function parseNic(input) {
  const nic = String(input || '').trim().toUpperCase();
  let year, day, serial, check;

  let m = nic.match(OLD);
  if (m) {
    [, year, day, serial, check] = m;
    year = 1900 + Number(year);
    serial = '0' + serial;
  } else if ((m = nic.match(NEW))) {
    [, year, day, serial, check] = m;
    year = Number(year);
  } else {
    return null;
  }

  day = Number(day);
  const gender = day > 500 ? 'Female' : 'Male';
  if (day > 500) day -= 500;
  if (day < 1 || day > 366) return null;

  // NIC days count Feb as 29
  const ref = new Date(Date.UTC(2000, 0, day));
  const dateOfBirth = new Date(Date.UTC(year, ref.getUTCMonth(), ref.getUTCDate()));

  // 29 Feb only exists in a leap year
  if (dateOfBirth.getUTCMonth() !== ref.getUTCMonth()) return null;

  return {
    nic,
    normalized: `${year}${String(m[2]).padStart(3, '0')}${serial}${check}`,
    gender,
    dateOfBirth,
  };
}

export function ageOn(dateOfBirth, today = new Date()) {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() < dateOfBirth.getUTCDate());
  return beforeBirthday ? age - 1 : age;
}
