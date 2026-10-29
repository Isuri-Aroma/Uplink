// Sri Lankan NIC helper.
// Old format: YY DDD SSS C + V/X   e.g. 901234567V
// New format: YYYY DDD SSSS C      e.g. 199012304567 (since 2016)
// DDD is the day of the birth year (1-366); women get +500 (501-866).
// The NIC calendar always counts February as 29 days.

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

  // Use a leap year to turn the day number into a month and date
  const ref = new Date(Date.UTC(2000, 0, day));
  const dateOfBirth = new Date(Date.UTC(year, ref.getUTCMonth(), ref.getUTCDate()));

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
