// Fills the database with demo data for development and the project demo.
// Run with: npm run seed   (this deletes existing Uplink data first)
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Ticket from '../models/Ticket.js';
import Counter, { nextNumber } from '../models/Counter.js';

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (d, hour = 10) => {
  const date = new Date(Date.now() - d * DAY);
  date.setHours(hour, 0, 0, 0);
  return date;
};
const hoursAfter = (date, h) => new Date(date.getTime() + h * 60 * 60 * 1000);

const staff = [
  { name: 'Nadeeka Wickramasinghe', email: 'admin@uplink.lk', password: 'Admin@1234', role: 'admin' },
  { name: 'Supun Jayawardena', email: 'supun@uplink.lk', password: 'Agent@1234', role: 'agent' },
  { name: 'Tharushi Fernando', email: 'tharushi@uplink.lk', password: 'Agent@1234', role: 'agent' },
  { name: 'Kasun Rajapaksha', email: 'kasun@uplink.lk', password: 'Agent@1234', role: 'agent', isActive: false },
];

const plans = [
  { name: 'Fibre 50', technology: 'Fibre', downMbps: 50, upMbps: 25, dataCapGB: 0, monthlyFeeLKR: 4990, description: 'Entry fibre plan for small homes' },
  { name: 'Fibre 100', technology: 'Fibre', downMbps: 100, upMbps: 50, dataCapGB: 0, monthlyFeeLKR: 6990, description: 'Most popular home fibre plan' },
  { name: 'Fibre 300', technology: 'Fibre', downMbps: 300, upMbps: 150, dataCapGB: 0, monthlyFeeLKR: 11990, description: 'For families streaming in 4K and working from home' },
  { name: 'Fibre Giga 1000', technology: 'Fibre', downMbps: 1000, upMbps: 500, dataCapGB: 0, monthlyFeeLKR: 19990, description: 'Gigabit fibre for power users' },
  { name: 'Biz Fibre 500', technology: 'Fibre', downMbps: 500, upMbps: 500, dataCapGB: 0, monthlyFeeLKR: 24990, description: 'Symmetric business fibre with static IP' },
  { name: 'VDSL Home 24', technology: 'VDSL', downMbps: 24, upMbps: 2, dataCapGB: 200, monthlyFeeLKR: 2990, description: 'Copper line broadband where fibre is not yet available' },
  { name: 'Home 4G 40', technology: '4G LTE', downMbps: 40, upMbps: 10, dataCapGB: 150, monthlyFeeLKR: 3490, description: 'Wireless home broadband, no phone line needed' },
  { name: '5G Home 500', technology: '5G', downMbps: 500, upMbps: 100, dataCapGB: 500, monthlyFeeLKR: 9990, description: '5G fixed wireless in Colombo and Kandy coverage areas' },
  { name: 'ADSL Classic 8', technology: 'VDSL', downMbps: 8, upMbps: 1, dataCapGB: 60, monthlyFeeLKR: 1490, description: 'Legacy plan, no longer sold', isActive: false },
];

// [name with initials, full name, NIC, mobile, address line, city, district, type]
const customers = [
  ['W. M. S. Bandara', 'Wijesinghe Mudiyanselage Sanath Bandara', '881542367V', '0771234567', 'No. 45, Temple Road', 'Kurunegala', 'Kurunegala'],
  ['K. A. D. Perera', 'Kankanamge Anusha Dilrukshi Perera', '199571203456', '0712345678', '12/3, Galle Road', 'Moratuwa', 'Colombo'],
  ['H. M. N. Kumari', 'Herath Mudiyanselage Nadeesha Kumari', '926543210V', '0752223344', '21, Peradeniya Road', 'Kandy', 'Kandy'],
  ['R. P. R. Gunasekara', 'Rajapaksha Pathirannahalage Ruwan Gunasekara', '197830104528', '0763344556', '88/1, Main Street', 'Matara', 'Matara'],
  ['D. M. I. Senanayake', 'Dissanayake Mudiyanselage Ishara Senanayake', '200168801234', '0784455667', '5, Lake Road', 'Anuradhapura', 'Anuradhapura'],
  ['S. A. C. Jayasuriya', 'Senarath Arachchige Chaminda Jayasuriya', '790451239V', '0705566778', '14, Station Road', 'Gampaha', 'Gampaha'],
  ['M. K. R. Fernando', 'Manikku Kankanamge Roshan Fernando', '198520903317', '0716677889', 'Lanka Spice Exports, 102 Negombo Road', 'Wattala', 'Gampaha', 'Business'],
  ['A. G. T. Pathirana', 'Amarasinghe Gamage Thilini Pathirana', '936012345V', '0727788990', '33, Kandy Road', 'Kegalle', 'Kegalle'],
  ['W. K. D. Ranasinghe', 'Warnakulasuriya Kurukulage Dinesh Ranasinghe', '200224507788', '0748899001', '7, Lighthouse Street', 'Galle', 'Galle'],
  ['T. M. P. Wijeratne', 'Thennakoon Mudiyanselage Prasanna Wijeratne', '820761458V', '0779900112', '19, Hospital Road', 'Badulla', 'Badulla'],
  ['P. L. S. Samarasinghe', 'Pallewela Liyanage Sachini Samarasinghe', '199883507712', '0701122334', '41, Dalada Veediya', 'Kandy', 'Kandy'],
  ['G. D. L. Abeysekara', 'Gamage Don Lasantha Abeysekara', '760982216V', '0772233445', 'Ceylon Print House, 210 High Level Road', 'Nugegoda', 'Colombo', 'Business'],
  ['E. M. K. Rathnayake', 'Ekanayake Mudiyanselage Kavindya Rathnayake', '200057304491', '0763456789', '9, Matale Road', 'Dambulla', 'Matale'],
  ['J. A. R. Silva', 'Jayasinghe Arachchige Ravindu Silva', '200711203345', '0718765432', '56, Kalutara Road', 'Panadura', 'Kalutara'],
  ['U. G. N. Dissanayake', 'Udugama Gedara Nimal Dissanayake', '650230987V', '0754321098', '3, Hill Street', 'Nuwara Eliya', 'Nuwara Eliya'],
];

// [customer #, plan, ordered days ago, events after order: [status, days after order, note], router, GB used]
const subscriptions = [
  [0, 'Fibre 100', 210, [['Active', 4, 'Installed by technician']], 'HW-HG8145V5-0012AB', 312.4],
  [1, 'Fibre 300', 180, [['Active', 3, 'Installed by technician']], 'HW-HG8145V5-0019F2', 655.0],
  [2, '5G Home 500', 150, [['Active', 1, 'Router delivered and activated']], 'ZTE-MC801A-55K21', 421.7],
  [3, 'VDSL Home 24', 400, [['Active', 6, 'Line tested OK'], ['Suspended', 300, 'Bill unpaid for 60 days']], 'ZTE-H267A-08812', 196.2],
  [4, 'Home 4G 40', 60, [['Active', 2, 'Router delivered and activated']], 'HW-B311-221A9', 142.9],
  [5, 'Fibre 50', 6, [], null, 0],
  [6, 'Biz Fibre 500', 320, [['Active', 7, 'Installed with static IP 203.94.72.18']], 'HW-HG8245Q2-77C10', 2104.3],
  [7, 'Fibre 100', 3, [], null, 0],
  [8, 'Home 4G 40', 500, [['Active', 1, 'Router delivered and activated'], ['Terminated', 420, 'Customer moved abroad']], 'HW-B311-1F0C2', 0],
  [9, 'VDSL Home 24', 270, [['Active', 5, 'Line tested OK']], 'ZTE-H267A-09934', 88.6],
  [10, 'Fibre Giga 1000', 45, [['Active', 4, 'Installed by technician']], 'HW-HN8145X6-3301D', 980.5],
  [11, 'Biz Fibre 500', 600, [['Active', 10, 'Installed with static IP 203.94.72.41']], 'HW-HG8245Q2-6A0B4', 1750.0],
  [12, 'Home 4G 40', 30, [['Active', 1, 'Router delivered and activated'], ['Suspended', 25, 'Customer requested temporary hold']], 'HW-B311-3C7D8', 60.1],
  [13, 'Fibre 50', 12, [['Active', 5, 'Installed by technician']], 'HW-HG8145V5-0042C7', 37.8],
  [14, 'VDSL Home 24', 900, [['Active', 7, 'Line tested OK']], 'ZTE-H267A-01177', 120.0],
  [0, '5G Home 500', 2, [], null, 0],
  [2, 'Fibre 100', 90, [['Terminated', 10, 'Area not ready for fibre, order cancelled']], null, 0],
  [11, 'Fibre 300', 100, [['Active', 6, 'Second line for branch office']], 'HW-HG8145V5-0033E1', 402.6],
  [6, 'Home 4G 40', 20, [['Active', 1, 'Backup 4G line for office']], 'HW-B311-4D1E9', 12.3],
  [9, 'Fibre 100', 1, [], null, 0],
];

// [subscription #, category, priority, subject, description, days ago opened, assignee #, events: [status, hours after open, note]]
const tickets = [
  [0, 'No Connection', 'Critical', 'Red LOS light on ONT', 'Customer reports red LOS light on the router since morning, no internet at all.', 0.2, 1, []],
  [1, 'Slow Speed', 'High', 'Getting 40 Mbps on 300 plan', 'Speed tests at night show around 40 Mbps on a 300 Mbps plan, both Wi-Fi and cable.', 1, 2, [['In Progress', 3, 'Checking OLT port utilisation']]],
  [2, 'Intermittent Drops', 'Medium', '5G signal drops in the evening', 'Connection drops for a few minutes several times every evening.', 2, 1, [['In Progress', 5, 'Asked customer to move router near a window']]],
  [6, 'Router Issue', 'High', 'Static IP not reachable', 'Office server on static IP is not reachable from outside since router reboot.', 3, 2, [['In Progress', 1, 'Remote login to router'], ['Resolved', 6, 'Port forwarding rules restored on router']]],
  [3, 'Billing Query', 'Low', 'Request to restore after payment', 'Customer paid outstanding bill at the branch and wants the line restored.', 4, null, []],
  [9, 'Slow Speed', 'Medium', 'Speed low after rain', 'Line speed drops to 4 Mbps after heavy rain, copper line issue suspected.', 9, 1, [['In Progress', 20, 'Technician scheduled'], ['Resolved', 52, 'Water-damaged joint in DP box replaced'], ['Closed', 70, 'Customer confirmed speed is normal']]],
  [10, 'Router Issue', 'Low', 'Wi-Fi 6 not showing', 'Customer cannot see the 5 GHz Wi-Fi network on new router.', 12, 2, [['Resolved', 2, 'Enabled 5 GHz band remotely'], ['Closed', 26, 'Customer confirmed']]],
  [11, 'No Connection', 'Critical', 'Office offline, fibre cut', 'Whole office offline. Road works outside the building this morning.', 15, 1, [['In Progress', 0.5, 'Field team dispatched'], ['Resolved', 7.5, 'Fibre cut by road works spliced'], ['Closed', 30, 'Customer confirmed service restored']]],
  [12, 'Relocation Request', 'Low', 'Move connection to new house', 'Customer is moving to Matale town next month and wants the connection moved.', 5, null, []],
  [13, 'Intermittent Drops', 'Medium', 'Drops when microwave is on', 'Wi-Fi drops whenever the microwave is used in the kitchen.', 7, 2, [['Resolved', 4, 'Advised customer to use 5 GHz Wi-Fi band']]],
  [14, 'Billing Query', 'Medium', 'Charged extra data fee', 'Customer was charged for extra data although usage was under the cap.', 20, 1, [['In Progress', 24, 'Sent to billing team'], ['Resolved', 96, 'Wrong charge reversed on next bill'], ['Closed', 120, 'Customer informed by SMS']]],
  [17, 'Slow Speed', 'High', 'Branch office slow uploads', 'Uploads to cloud backup are very slow at the branch office.', 0.5, null, []],
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  console.log('Clearing old data...');
  await Promise.all([User, Plan, Customer, Subscription, Ticket, Counter].map((m) => m.deleteMany({})));

  // Staff are saved one by one so their passwords get hashed
  const users = [];
  for (const s of staff) users.push(await User.create(s));
  const admin = users[0];

  const planDocs = await Plan.create(plans);
  const planByName = Object.fromEntries(planDocs.map((p) => [p.name, p]));

  const customerDocs = [];
  for (const [i, [nameWithInitials, fullName, nic, mobile, line1, city, district, type]] of customers.entries()) {
    customerDocs.push(
      await Customer.create({
        nameWithInitials, fullName, nic, mobile,
        email: `${fullName.split(' ').pop().toLowerCase()}${i + 1}@gmail.com`,
        address: { line1, city, district },
        customerType: type || 'Residential',
        createdAt: daysAgo(1000 - i * 20),
      })
    );
  }

  const subDocs = [];
  for (const [ci, planName, orderedAgo, events, routerSerial, usedGB] of subscriptions) {
    const customer = customerDocs[ci];
    const plan = planByName[planName];
    const ordered = daysAgo(orderedAgo);
    const history = [{ status: 'Pending', note: `New connection ordered on ${planName}`, at: ordered, by: admin._id }];
    let status = 'Pending';
    let installDate;
    for (const [s, after, note] of events) {
      const at = new Date(ordered.getTime() + after * DAY);
      history.push({ status: s, note, at, by: users[1 + (history.length % 2)]._id });
      if (s === 'Active' && !installDate) installDate = at;
      status = s;
    }
    subDocs.push(
      await Subscription.create({
        accountNo: await nextNumber('subscription', 'SUB'),
        customer: customer._id,
        plan: plan._id,
        installAddress: customer.address.toObject(),
        status,
        statusHistory: history,
        installDate,
        routerSerial: routerSerial || undefined,
        usedGB,
        createdAt: ordered,
      })
    );
  }

  for (const [si, category, priority, subject, description, openedAgo, assignee, events] of tickets) {
    const subscription = subDocs[si];
    const customer = customerDocs.find((c) => c._id.equals(subscription.customer));
    const opened = new Date(Date.now() - openedAgo * DAY);
    const activity = [{ status: 'Open', note: 'Ticket logged', at: opened, by: admin._id }];
    const ticket = {
      ticketNo: await nextNumber('ticket', 'TT'),
      subscription: subscription._id,
      category, priority, subject, description,
      contactMobile: customer.mobile,
      assignedTo: assignee === null ? undefined : users[assignee]._id,
      status: 'Open',
      createdAt: opened,
    };
    for (const [s, hours, note] of events) {
      const at = hoursAfter(opened, hours);
      activity.push({ status: s, note, at, by: ticket.assignedTo || admin._id });
      ticket.status = s;
      if (s === 'Resolved') { ticket.resolution = note; ticket.resolvedAt = at; }
      if (s === 'Closed') ticket.closedAt = at;
    }
    await Ticket.create({ ...ticket, activity });
  }

  console.log(`Seeded ${users.length} staff, ${planDocs.length} plans, ${customerDocs.length} customers, ` +
    `${subDocs.length} subscriptions, ${tickets.length} tickets.\n`);
  console.log('Sign in with:');
  console.log('  Admin  admin@uplink.lk   / Admin@1234');
  console.log('  Agent  supun@uplink.lk   / Agent@1234');
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
