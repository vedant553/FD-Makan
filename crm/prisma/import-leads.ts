import fs from "node:fs";
import path from "node:path";

import { LeadStatus, PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

type CliOptions = {
  filePath: string;
  orgId?: string;
  orgAdminEmail?: string;
  assignedToEmail?: string;
  dryRun: boolean;
  truncate: boolean;
  limit?: number;
};

function getArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function parseArgs(): CliOptions {
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const filePath = getArg("--file") ?? positional[0];
  if (!filePath) {
    throw new Error(
      "Missing --file argument. Example: npm run import:leads -- --file \"./All Leads.xlsx\" --org-admin-email admin@acmecrm.com",
    );
  }

  return {
    filePath,
    orgId: getArg("--org-id"),
    orgAdminEmail: getArg("--org-admin-email") ?? positional[1],
    assignedToEmail: getArg("--assigned-to-email"),
    dryRun: hasFlag("--dry-run"),
    truncate: hasFlag("--truncate"),
    limit: getArg("--limit") ? Number(getArg("--limit")) : undefined,
  };
}

const headerAliases = {
  leadNumber: ["lead number"],
  leadDate: ["lead date"],
  assignedDate: ["assigned date"],
  returnedDate: ["returned date"],
  name: ["name", "lead name", "customer name", "full name"],
  phone: ["phone", "mobile", "mobile no", "phone number", "contact number"],
  mobileCc: ["mobile cc"],
  secondaryNoCc: ["secondary no cc"],
  secondaryNo: ["secondary no"],
  email: ["email", "email id", "mail"],
  executive: ["executive"],
  coOwners: ["co owners"],
  sourcingManager: ["sourcing manager"],
  presalesUserName: ["presalesusername", "pre sales agent", "presales user name"],
  stageLabel: ["stage"],
  stageReason: ["stage reason"],
  source: ["source", "lead source", "city", "location"],
  subSource: ["subsource", "sub source"],
  campaignName: ["campaign name"],
  campaignChannelName: ["campaign channel name"],
  adName: ["adname", "ad name"],
  category: ["category"],
  projectNames: ["project names", "project"],
  minBudget: ["min budget"],
  maxBudget: ["max budget"],
  location: ["location"],
  subLocation: ["sublocation", "sub location"],
  channelPartnerName: ["channel partner name"],
  cpMobile: ["cp mobile"],
  lastAssignedSalesAgent: ["last assigned sales agent", "sales agent"],
  lastAssignedSalesAgentStage: ["last assigned sales agent stage"],
  lastAssignedDate: ["last assigned date"],
  lastActivity: ["last activity"],
  lastActivityDate: ["last activity date"],
  lastContactedDate: ["last contacted date"],
  remark: ["remark"],
  returning: ["returning"],
  returningCount: ["returning count"],
  taskCountAfterReturned: ["task count after returned"],
  completedTaskCount: ["completed task count"],
  pendingTaskCount: ["pending task count"],
  conductedSiteVisitCount: ["conducted sitevisit count"],
  pendingSiteVisitCount: ["pending sitevisit count"],
  firstActivityDate: ["first activity date"],
  firstActivityRemark: ["first activity remark"],
  firstStage: ["first stage"],
  firstStageUpdatedDate: ["first stage updated date"],
  cpTagRemainingDays: ["cp tag remaining days"],
  utmCampaign: ["utm campaign"],
  utmMedium: ["utm medium"],
  utmSource: ["utm source"],
  utmTerm: ["utm term"],
  utmContent: ["utm content"],
  gclId: ["gclid", "gclid"],
  fbId: ["fbid", "fb id"],
  employmentType: ["employmenttype", "employment type"],
  income: ["income"],
  ethnicity: ["ethnicity"],
  designation: ["designation"],
  companyName: ["companyname", "company name"],
  companyAddress: ["companyaddress", "company address"],
  assignedToEmail: ["assigned to", "assigned to email", "owner email", "assignee email"],
} as const;

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function pickValue(row: Record<string, unknown>, aliases: readonly string[]) {
  const normalizedEntries = Object.entries(row).map(([k, v]) => [normalizeHeader(k), v] as const);
  for (const alias of aliases) {
    const found = normalizedEntries.find(([k]) => k === alias);
    if (found && found[1] !== undefined && found[1] !== null && String(found[1]).trim() !== "") {
      return String(found[1]).trim();
    }
  }
  return undefined;
}

function parseLeadStatus(input?: string): LeadStatus {
  const v = (input ?? "").trim().toUpperCase();
  if (v.includes("NEW")) return LeadStatus.NEW;
  if (v.includes("BOOK") || v.includes("CLOSE") || v.includes("WON") || v.includes("LOST")) return LeadStatus.CLOSED;
  if (v.includes("PROSPECT") || v.includes("WORKABLE") || v.includes("QUALIFIED")) return LeadStatus.QUALIFIED;
  if (v.includes("OPEN") || v.includes("FOLLOW") || v.includes("CALL BACK") || v.includes("TAGGED") || v.includes("CONTACT")) {
    return LeadStatus.CONTACTED;
  }
  return LeadStatus.NEW;
}

function normalizePhone(value?: string) {
  if (!value) return "";
  return value.replace(/[^\d+]/g, "");
}

function parseDateInput(value?: string): Date | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const asNumber = Number(v);
  if (!Number.isNaN(asNumber) && asNumber > 1000) {
    const parsed = XLSX.SSF.parse_date_code(asNumber);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
    }
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseFloatInput(value?: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function parseIntInput(value?: string): number | null {
  const n = parseFloatInput(value);
  return n === null ? null : Math.round(n);
}

function parseBooleanInput(value?: string): boolean | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (["yes", "true", "1"].includes(v)) return true;
  if (["no", "false", "0"].includes(v)) return false;
  return null;
}

async function resolveOrgId(options: CliOptions) {
  if (options.orgId) return options.orgId;
  if (!options.orgAdminEmail) {
    throw new Error("Provide either --org-id or --org-admin-email");
  }

  const admin = await prisma.user.findUnique({
    where: { email: options.orgAdminEmail },
    select: { organizationId: true },
  });
  if (!admin) throw new Error(`No user found for --org-admin-email ${options.orgAdminEmail}`);
  return admin.organizationId;
}

async function main() {
  const options = parseArgs();
  const absFilePath = path.isAbsolute(options.filePath)
    ? options.filePath
    : path.join(process.cwd(), options.filePath);

  if (!fs.existsSync(absFilePath)) {
    throw new Error(`Excel file not found: ${absFilePath}`);
  }

  const organizationId = await resolveOrgId(options);
  const defaultAssignee = options.assignedToEmail
    ? await prisma.user.findFirst({
        where: { email: options.assignedToEmail, organizationId },
        select: { id: true, email: true },
      })
    : null;

  if (options.assignedToEmail && !defaultAssignee) {
    throw new Error(`--assigned-to-email user not found in target org: ${options.assignedToEmail}`);
  }

  if (options.truncate && !options.dryRun) {
    await prisma.lead.deleteMany({ where: { organizationId } });
    console.log(`Deleted existing leads for org ${organizationId}`);
  }

  const workbook = XLSX.readFile(absFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rowsAll = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const rows = options.limit && options.limit > 0 ? rowsAll.slice(0, options.limit) : rowsAll;

  let created = 0;
  let updated = 0;
  let skipped = 0;

  let processed = 0;
  for (const row of rows) {
    const name = pickValue(row, headerAliases.name);
    const phone = normalizePhone(pickValue(row, headerAliases.phone));
    const email = pickValue(row, headerAliases.email);
    const stageLabel = pickValue(row, headerAliases.stageLabel) ?? "";
    const source = pickValue(row, headerAliases.source) ?? "Imported";
    const status = parseLeadStatus(stageLabel);
    const rowAssigneeEmail = pickValue(row, headerAliases.assignedToEmail);

    if (!name || !phone) {
      skipped += 1;
      continue;
    }

    let assignedToId: string | null | undefined = defaultAssignee?.id;
    if (rowAssigneeEmail) {
      const assignee = await prisma.user.findFirst({
        where: { email: rowAssigneeEmail, organizationId },
        select: { id: true },
      });
      assignedToId = assignee?.id ?? defaultAssignee?.id ?? null;
    }

    if (options.dryRun) {
      created += 1;
      processed += 1;
      if (processed % 500 === 0) console.log(`Processed ${processed}/${rows.length} rows...`);
      continue;
    }

    const existing = await prisma.lead.findFirst({
      where: { organizationId, phone },
      select: { id: true },
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          leadNumber: pickValue(row, headerAliases.leadNumber) || null,
          leadDate: parseDateInput(pickValue(row, headerAliases.leadDate)),
          assignedDate: parseDateInput(pickValue(row, headerAliases.assignedDate)),
          name,
          email: email || null,
          source,
          status,
          stageLabel: stageLabel || null,
          stageReason: pickValue(row, headerAliases.stageReason) || null,
          subSource: pickValue(row, headerAliases.subSource) || null,
          campaignName: pickValue(row, headerAliases.campaignName) || null,
          projectNames: pickValue(row, headerAliases.projectNames) || null,
          minBudget: parseFloatInput(pickValue(row, headerAliases.minBudget)),
          maxBudget: parseFloatInput(pickValue(row, headerAliases.maxBudget)),
          location: pickValue(row, headerAliases.location) || null,
          subLocation: pickValue(row, headerAliases.subLocation) || null,
          channelPartnerName: pickValue(row, headerAliases.channelPartnerName) || null,
          cpMobile: normalizePhone(pickValue(row, headerAliases.cpMobile)) || null,
          sourcingManager: pickValue(row, headerAliases.sourcingManager) || null,
          presalesUserName: pickValue(row, headerAliases.presalesUserName) || null,
          lastAssignedSalesAgent: pickValue(row, headerAliases.lastAssignedSalesAgent) || null,
          lastActivity: pickValue(row, headerAliases.lastActivity) || null,
          lastActivityDate: parseDateInput(pickValue(row, headerAliases.lastActivityDate)),
          remark: pickValue(row, headerAliases.remark) || null,
          returningCount: parseIntInput(pickValue(row, headerAliases.returningCount)),
          pendingTaskCount: parseIntInput(pickValue(row, headerAliases.pendingTaskCount)),
          ethnicity: pickValue(row, headerAliases.ethnicity) || null,
          assignedToId: assignedToId ?? null,
        },
      });
      updated += 1;
    } else {
      await prisma.lead.create({
        data: {
          leadNumber: pickValue(row, headerAliases.leadNumber) || null,
          leadDate: parseDateInput(pickValue(row, headerAliases.leadDate)),
          assignedDate: parseDateInput(pickValue(row, headerAliases.assignedDate)),
          name,
          phone,
          email: email || null,
          source,
          status,
          stageLabel: stageLabel || null,
          stageReason: pickValue(row, headerAliases.stageReason) || null,
          subSource: pickValue(row, headerAliases.subSource) || null,
          campaignName: pickValue(row, headerAliases.campaignName) || null,
          projectNames: pickValue(row, headerAliases.projectNames) || null,
          minBudget: parseFloatInput(pickValue(row, headerAliases.minBudget)),
          maxBudget: parseFloatInput(pickValue(row, headerAliases.maxBudget)),
          location: pickValue(row, headerAliases.location) || null,
          subLocation: pickValue(row, headerAliases.subLocation) || null,
          channelPartnerName: pickValue(row, headerAliases.channelPartnerName) || null,
          cpMobile: normalizePhone(pickValue(row, headerAliases.cpMobile)) || null,
          sourcingManager: pickValue(row, headerAliases.sourcingManager) || null,
          presalesUserName: pickValue(row, headerAliases.presalesUserName) || null,
          lastAssignedSalesAgent: pickValue(row, headerAliases.lastAssignedSalesAgent) || null,
          lastActivity: pickValue(row, headerAliases.lastActivity) || null,
          lastActivityDate: parseDateInput(pickValue(row, headerAliases.lastActivityDate)),
          remark: pickValue(row, headerAliases.remark) || null,
          returningCount: parseIntInput(pickValue(row, headerAliases.returningCount)),
          pendingTaskCount: parseIntInput(pickValue(row, headerAliases.pendingTaskCount)),
          ethnicity: pickValue(row, headerAliases.ethnicity) || null,
          assignedToId: assignedToId ?? null,
          organizationId,
        },
      });
      created += 1;
    }

    processed += 1;
    if (processed % 500 === 0) console.log(`Processed ${processed}/${rows.length} rows...`);
  }

  console.log(
    JSON.stringify(
      {
        file: absFilePath,
        organizationId,
        dryRun: options.dryRun,
        rows: rows.length,
        originalRows: rowsAll.length,
        created,
        updated,
        skipped,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
