import { createPdf, fields, savePdf, section, signatures, writingBox } from '../../utils/pdf';
import { dataCap, lkr, shortDate, speed } from '../../utils/format';

const TERMS = [
  'The monthly fee is billed in advance from the activation date.',
  'Data caps reset on the first day of each billing month. Unlimited plans have no cap.',
  'The router (ONT) stays the property of the provider and must be returned when the service ends.',
  'Either party may end the service with 30 days written notice.',
];

// Connection form the customer signs at the branch
export function downloadServiceOrder(s) {
  const c = s.customer || {};
  const p = s.plan || {};
  const a = s.installAddress || {};
  const billing = c.address ? `${c.address.line1}, ${c.address.city}, ${c.address.district} District` : '-';
  const pdf = createPdf('Broadband service order', s.accountNo);

  section(pdf, 'Customer');
  fields(pdf, [
    ['Name with initials', c.nameWithInitials], ['NIC', c.nic], ['Customer type', c.customerType],
    ['Full name', c.fullName, 3],
    ['Mobile', c.mobile], ['Email', c.email || 'Not given', 2],
    ['Billing address', billing, 3],
  ]);

  section(pdf, 'Service');
  fields(pdf, [
    ['Plan', p.name], ['Technology', p.technology], ['Speed', speed(p.downMbps, p.upMbps)],
    ['Data', dataCap(p.dataCapGB)], ['Monthly fee', lkr(p.monthlyFeeLKR)], ['Status', s.status],
    ['Order date', shortDate(s.createdAt)], ['Installed on', s.installDate ? shortDate(s.installDate) : 'Not installed yet'], ['Router serial', s.routerSerial || 'To be fitted'],
    ['Installation site', `${a.line1 || ''}, ${a.city || ''}, ${a.district || ''} District`, 3],
  ]);

  section(pdf, 'Terms');
  const { doc } = pdf;
  doc.setTextColor(12, 34, 48).setFont('helvetica', 'normal').setFontSize(9);
  TERMS.forEach((t, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${t}`, 182);
    doc.text(lines, 14, pdf.y);
    pdf.y += lines.length * 4.4 + 1.5;
  });
  pdf.y += 4;

  section(pdf, 'Office use');
  writingBox(pdf, 'NIC copy checked · proof of address checked · officer remarks', 2);

  signatures(pdf, 'Customer', 'Uplink officer');
  savePdf(pdf, `${s.accountNo}-service-order.pdf`, `${s.accountNo} · ${c.nameWithInitials || ''} · ${p.name || ''}`);
}
