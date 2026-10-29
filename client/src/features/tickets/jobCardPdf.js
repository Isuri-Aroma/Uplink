import { createPdf, fields, savePdf, section, signatures, writingBox } from '../../utils/pdf';
import { dateTime } from '../../utils/format';

// Field job card a technician takes to site
export function downloadJobCard(t) {
  const sub = t.subscription || {};
  const c = sub.customer || {};
  const a = sub.installAddress || {};
  const pdf = createPdf('Field job card', t.ticketNo);

  section(pdf, 'Fault');
  fields(pdf, [
    ['Category', t.category], ['Priority', t.priority], ['Status', t.status],
    ['Opened', dateTime(t.createdAt)], ['Assigned to', t.assignedTo?.name || 'Unassigned'], ['Call-back number', t.contactMobile],
    ['Subject', t.subject, 3],
  ]);
  fields(pdf, [['Reported by customer', t.description, 1]], 1);

  section(pdf, 'Service and site');
  fields(pdf, [
    ['Account', sub.accountNo], ['Plan', `${sub.plan?.name || '-'} (${sub.plan?.technology || '-'})`], ['Router serial', sub.routerSerial || 'Not recorded'],
    ['Customer', c.nameWithInitials], ['NIC', c.nic], ['Mobile', c.mobile],
    ['Site address', `${a.line1 || ''}, ${a.city || ''}, ${a.district || ''} District`, 3],
  ]);

  if (t.resolution) {
    section(pdf, 'Resolution on record');
    fields(pdf, [['Fix', t.resolution, 1]], 1);
  }

  section(pdf, 'Work on site (technician to complete)');
  writingBox(pdf, 'Work carried out', 4);
  writingBox(pdf, 'Parts used (ONT, patch cord, splitter, cable length)', 2);
  fields(pdf, [['Arrived', '____ : ____'], ['Left', '____ : ____'], ['Service restored', 'Yes  /  No']]);

  signatures(pdf, 'Technician', 'Customer');
  savePdf(pdf, `${t.ticketNo}-job-card.pdf`, `${t.ticketNo} · ${sub.accountNo || ''} · ${c.nameWithInitials || ''}`);
}
