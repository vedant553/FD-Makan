import { hash } from "bcryptjs";
import {
  AutomationActionType,
  AutomationTriggerType,
  CampaignSource,
  LeadStatus,
  PrismaClient,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.propertyLead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({ data: { name: "Acme Realty" } });

  const [admin, manager, agent] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Aditi Admin",
        email: "admin@acmecrm.com",
        password: await hash("Admin@123", 10),
        role: UserRole.ADMIN,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Manish Manager",
        email: "manager@acmecrm.com",
        password: await hash("Manager@123", 10),
        role: UserRole.MANAGER,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Arjun Agent",
        email: "agent@acmecrm.com",
        password: await hash("Agent@123", 10),
        role: UserRole.AGENT,
        organizationId: org.id,
      },
    }),
  ]);

  const campaign = await prisma.campaign.create({
    data: {
      name: "Q2 Facebook Housing Push",
      source: CampaignSource.FACEBOOK,
      budget: 200000,
      spent: 120000,
      organizationId: org.id,
    },
  });

  const [lead1, lead2, lead3] = await Promise.all([
    prisma.lead.create({
      data: {
        name: "Rohit Verma",
        phone: "+91-9000011111",
        email: "rohit@example.com",
        source: "Pune",
        status: LeadStatus.NEW,
        assignedToId: agent.id,
        campaignId: campaign.id,
        organizationId: org.id,
      },
    }),
    prisma.lead.create({
      data: {
        name: "Neha Kapoor",
        phone: "+91-9000022222",
        email: "neha@example.com",
        source: "Mumbai",
        status: LeadStatus.CONTACTED,
        assignedToId: manager.id,
        organizationId: org.id,
      },
    }),
    prisma.lead.create({
      data: {
        name: "Sanjay Singh",
        phone: "+91-9000033333",
        email: "sanjay@example.com",
        source: "Pune",
        status: LeadStatus.CLOSED,
        assignedToId: agent.id,
        campaignId: campaign.id,
        organizationId: org.id,
      },
    }),
  ]);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Call Rohit for budget discussion",
        description: "Understand budget and preferred location.",
        leadId: lead1.id,
        assignedToId: agent.id,
        createdById: admin.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: tomorrow,
        reminderTime: new Date(tomorrow.getTime() - 30 * 60 * 1000),
        organizationId: org.id,
      },
      {
        title: "Send shortlist to Neha",
        description: "Inventory options",
        leadId: lead2.id,
        assignedToId: manager.id,
        createdById: admin.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        dueDate: tomorrow,
        reminderTime: new Date(tomorrow.getTime() - 60 * 60 * 1000),
        organizationId: org.id,
      },
    ],
  });

  const [property1, property2] = await Promise.all([
    prisma.property.create({
      data: {
        name: "Green Heights 3BHK",
        price: 12500000,
        location: "Pune",
        status: "AVAILABLE",
        assignedToId: agent.id,
        organizationId: org.id,
      },
    }),
    prisma.property.create({
      data: {
        name: "Sea View Towers 2BHK",
        price: 9800000,
        location: "Mumbai",
        status: "AVAILABLE",
        assignedToId: manager.id,
        organizationId: org.id,
      },
    }),
  ]);

  await prisma.propertyLead.createMany({
    data: [
      { leadId: lead1.id, propertyId: property1.id, matchScore: 88, organizationId: org.id },
      { leadId: lead2.id, propertyId: property2.id, matchScore: 81, organizationId: org.id },
      { leadId: lead3.id, propertyId: property1.id, matchScore: 92, organizationId: org.id },
    ],
  });

  await prisma.siteVisit.create({
    data: {
      leadId: lead3.id,
      propertyId: property1.id,
      scheduledAt: tomorrow,
      status: "COMPLETED",
      notes: "Customer liked the property and negotiated final price.",
      assignedToId: agent.id,
      organizationId: org.id,
      photos: [],
    },
  });

  const deal = await prisma.deal.create({
    data: {
      leadId: lead3.id,
      propertyId: property1.id,
      value: 12000000,
      status: "CLOSED",
      closedAt: now,
      organizationId: org.id,
    },
  });

  await prisma.payment.createMany({
    data: [
      { dealId: deal.id, amount: 4000000, status: "RECEIVED", date: now, organizationId: org.id },
      { dealId: deal.id, amount: 8000000, status: "RECEIVED", date: now, organizationId: org.id },
    ],
  });

  await prisma.callLog.createMany({
    data: [
      {
        phone: lead1.phone,
        leadId: lead1.id,
        userId: agent.id,
        status: "CONNECTED",
        duration: 240,
        notes: "Interested in west zone projects",
        organizationId: org.id,
      },
      {
        phone: lead2.phone,
        leadId: lead2.id,
        userId: manager.id,
        status: "MISSED",
        duration: 0,
        notes: "Will retry in evening",
        organizationId: org.id,
      },
    ],
  });

  await prisma.messageTemplate.createMany({
    data: [
      {
        name: "Visit Reminder",
        channel: "WHATSAPP",
        content: "Hi {{name}}, your site visit is scheduled for tomorrow.",
        organizationId: org.id,
      },
      {
        name: "Deal Follow-up",
        channel: "EMAIL",
        content: "Thank you for visiting. Please find the final deal sheet attached.",
        organizationId: org.id,
      },
    ],
  });

  await prisma.attendance.createMany({
    data: [
      { userId: manager.id, date: now, status: "PRESENT", organizationId: org.id },
      { userId: agent.id, date: now, status: "PRESENT", organizationId: org.id },
    ],
  });

  await prisma.automationRule.createMany({
    data: [
      {
        name: "Lead created -> WhatsApp intro",
        triggerType: AutomationTriggerType.LEAD_CREATED,
        actionType: AutomationActionType.SEND_MESSAGE,
        config: { channel: "WHATSAPP", content: "Thanks for your inquiry. Our team will connect shortly." },
        organizationId: org.id,
        isActive: true,
      },
      {
        name: "Task completed -> Next follow-up task",
        triggerType: AutomationTriggerType.TASK_COMPLETED,
        actionType: AutomationActionType.CREATE_TASK,
        config: { title: "Post-completion follow-up", priority: "MEDIUM" },
        organizationId: org.id,
        isActive: true,
      },
    ],
  });

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { leadsGenerated: 2, revenueGenerated: 12000000 },
  });

  console.log("Extended CRM seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
