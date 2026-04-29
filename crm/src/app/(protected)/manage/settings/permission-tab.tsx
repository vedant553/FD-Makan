"use client";

import { useState } from "react";

const permissionNavItems = [
  "Authentication",
  "Lead Management",
  "Contact Management",
  "CP Management",
  "Property Management",
  "Call Management",
] as const;

type PermissionSection = (typeof permissionNavItems)[number];

function PermCheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#3f4658]">
      <input suppressHydrationWarning type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db]" />
      <span>{label}</span>
    </label>
  );
}

function OrDivider() {
  return <div className="py-1 text-center text-[11px] font-medium text-gray-400">OR</div>;
}

const adminOptions = ["Aman Dubey", "Ajay Jaiswal", "Pranay Waghmare"] as const;

export function SettingsPermissionTab() {
  const [section, setSection] = useState<PermissionSection>("Authentication");

  const [auth, setAuth] = useState({ twoFactorOtp: false });

  const [lead, setLead] = useState({
    roundRobin: true,
    roundRobinMembers: "",
    allAgentsAtOnce: false,
    projectLocationAllAgents: false,
    workingHoursRouting: false,
    ivrAutoLead: false,
    dontMergeReturning: true,
    salesAgentWiseTimeline: false,
    addLeadOwnerInterval: false,
    transferUnqualifiedToContact: false,
    transferUnqualifiedToAdmin: false,
    autoRouteUntouched: true,
    untouchedDurationHours: "0.5",
    mappedOfflineLogsOnly: false,
    mandatoryReqFormBeforeStage: false,
    autoUpdateStageOnReturn: true,
    leadStageOnReturn: "Open",
    autoUpdateInactiveOnReturn: false,
    allowDuplicateLeads: false,
    allowDuplicateProjectSource: false,
    autoAssignCategoryFromStage: false,
    restrictBackwardCategory: false,
    mandatoryReqBeforeSiteVisit: false,
    projectWiseRevisit: false,
  });

  const [contact, setContact] = useState({
    allowDuplicate: true,
    transferInactiveToAdmin: true,
    chooseAdmin: "Aman Dubey",
  });

  const [cp, setCp] = useState({
    showUserWiseCp: false,
    cpTaggingDurationLimit: false,
    addSourcingManagerOnAssign: false,
    removeSourcingManagerOnDelete: false,
    allowDuplicateCpAgentWise: false,
    removeSourcingWithoutSiteVisit: false,
  });

  const [property, setProperty] = useState({ salesAgentWiseProperty: false });

  const [call, setCall] = useState({
    autoCallUpcomingTask: false,
    autoDialNewLead: false,
    autoDialDailyMissed: false,
    ruleBasedCalling: false,
    compulsoryFeedback: true,
    contactWaitSeconds: "0",
    leadWaitSeconds: "0",
  });

  return (
    <div className="space-y-3">
      <div className="rounded border border-gray-200 bg-[#f5f6f8] px-3 py-2 text-sm font-semibold text-[#3f4658]">Management</div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px_1fr]">
        <div className="rounded border border-gray-200 bg-white">
          <div className="max-h-[640px] overflow-y-auto p-2">
            {permissionNavItems.map((item) => (
              <button
                key={item}
                suppressHydrationWarning
                type="button"
                onClick={() => setSection(item)}
                className={`mb-1 block w-full rounded px-3 py-2 text-left text-xs font-medium ${section === item ? "bg-[#1a56db] text-white" : "text-[#2f4f76] hover:bg-gray-100"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col rounded border border-gray-200 bg-white">
          <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-[#3f4658]">{section}</h3>
          <div className="max-h-[min(560px,calc(100vh-260px))] flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {section === "Authentication" ? (
              <PermCheckRow checked={auth.twoFactorOtp} onChange={(v) => setAuth((p) => ({ ...p, twoFactorOtp: v }))} label="Enable two factor authentication with OTP" />
            ) : null}

            {section === "Lead Management" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <PermCheckRow checked={lead.roundRobin} onChange={(v) => setLead((p) => ({ ...p, roundRobin: v }))} label="Enable auto lead routing (Round robin method)" />
                  {lead.roundRobin ? (
                    <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-3">
                      <label className="block text-[11px] font-medium text-gray-600">Include Members for Round Robin</label>
                      <select
                        suppressHydrationWarning
                        value={lead.roundRobinMembers}
                        onChange={(e) => setLead((p) => ({ ...p, roundRobinMembers: e.target.value }))}
                        className="h-9 w-full max-w-md rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                      >
                        <option value="">Select Sales Agent</option>
                        <option value="team1">Panvel Team</option>
                        <option value="team2">Kharghar Team</option>
                      </select>
                      <OrDivider />
                    </div>
                  ) : null}
                </div>
                <PermCheckRow checked={lead.allAgentsAtOnce} onChange={(v) => setLead((p) => ({ ...p, allAgentsAtOnce: v }))} label="Enable auto lead routing (All sales agent at once)" />
                <PermCheckRow checked={lead.projectLocationAllAgents} onChange={(v) => setLead((p) => ({ ...p, projectLocationAllAgents: v }))} label="Enable auto lead routing for Project and Location (All sales agent at once)" />
                <PermCheckRow checked={lead.workingHoursRouting} onChange={(v) => setLead((p) => ({ ...p, workingHoursRouting: v }))} label="Enable working hours for lead routing" />
                <PermCheckRow checked={lead.ivrAutoLead} onChange={(v) => setLead((p) => ({ ...p, ivrAutoLead: v }))} label="Auto lead creation of all incoming IVR calling" />
                <PermCheckRow checked={lead.dontMergeReturning} onChange={(v) => setLead((p) => ({ ...p, dontMergeReturning: v }))} label="Don't Merge returning leads, assign it to new sales executive as a co-owner (Round robin method)" />
                <PermCheckRow checked={lead.salesAgentWiseTimeline} onChange={(v) => setLead((p) => ({ ...p, salesAgentWiseTimeline: v }))} label="Show sales agent wise Task and Lead timeline" />
                <PermCheckRow checked={lead.addLeadOwnerInterval} onChange={(v) => setLead((p) => ({ ...p, addLeadOwnerInterval: v }))} label="Add Lead owner at an interval" />
                <PermCheckRow checked={lead.transferUnqualifiedToContact} onChange={(v) => setLead((p) => ({ ...p, transferUnqualifiedToContact: v }))} label="On unqualified/inactive lead, transfer lead to contact" />
                <PermCheckRow checked={lead.transferUnqualifiedToAdmin} onChange={(v) => setLead((p) => ({ ...p, transferUnqualifiedToAdmin: v }))} label="On unqualified/inactive lead, transfer lead from sales executive to admin" />
                <div className="space-y-2">
                  <PermCheckRow checked={lead.autoRouteUntouched} onChange={(v) => setLead((p) => ({ ...p, autoRouteUntouched: v }))} label="Auto Route Untouched Lead" />
                  {lead.autoRouteUntouched ? (
                    <div className="ml-6 max-w-xs space-y-1 border-l-2 border-gray-100 pl-3">
                      <label className="block text-[11px] font-medium text-gray-600">Duration(In Hours)</label>
                      <input
                        suppressHydrationWarning
                        value={lead.untouchedDurationHours}
                        onChange={(e) => setLead((p) => ({ ...p, untouchedDurationHours: e.target.value }))}
                        className="h-9 w-full rounded border border-gray-300 px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                      />
                    </div>
                  ) : null}
                </div>
                <PermCheckRow checked={lead.mappedOfflineLogsOnly} onChange={(v) => setLead((p) => ({ ...p, mappedOfflineLogsOnly: v }))} label="Show only mapped offline call logs" />
                <PermCheckRow checked={lead.mandatoryReqFormBeforeStage} onChange={(v) => setLead((p) => ({ ...p, mandatoryReqFormBeforeStage: v }))} label="Mandatory complete requirement form before updating / changing a particular lead stage." />
                <div className="space-y-2">
                  <PermCheckRow checked={lead.autoUpdateStageOnReturn} onChange={(v) => setLead((p) => ({ ...p, autoUpdateStageOnReturn: v }))} label="Auto update lead stage on return." />
                  {lead.autoUpdateStageOnReturn ? (
                    <div className="ml-6 max-w-xs space-y-1 border-l-2 border-gray-100 pl-3">
                      <label className="block text-[11px] font-medium text-gray-600">Lead Stage</label>
                      <select
                        suppressHydrationWarning
                        value={lead.leadStageOnReturn}
                        onChange={(e) => setLead((p) => ({ ...p, leadStageOnReturn: e.target.value }))}
                        className="h-9 w-full rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                      >
                        <option value="Open">Open</option>
                        <option value="Prospect">Prospect</option>
                        <option value="New Lead">New Lead</option>
                      </select>
                    </div>
                  ) : null}
                </div>
                <OrDivider />
                <PermCheckRow checked={lead.autoUpdateInactiveOnReturn} onChange={(v) => setLead((p) => ({ ...p, autoUpdateInactiveOnReturn: v }))} label="Auto update stage of Inactive leads on return." />
                <PermCheckRow checked={lead.allowDuplicateLeads} onChange={(v) => setLead((p) => ({ ...p, allowDuplicateLeads: v }))} label="Allow duplicate leads." />
                <PermCheckRow checked={lead.allowDuplicateProjectSource} onChange={(v) => setLead((p) => ({ ...p, allowDuplicateProjectSource: v }))} label="Allow duplicate leads for project and source." />
                <PermCheckRow checked={lead.autoAssignCategoryFromStage} onChange={(v) => setLead((p) => ({ ...p, autoAssignCategoryFromStage: v }))} label="Auto-Assign Lead Category Based on Lead Stage." />
                <PermCheckRow checked={lead.restrictBackwardCategory} onChange={(v) => setLead((p) => ({ ...p, restrictBackwardCategory: v }))} label="Restrict Backward Lead Category Change." />
                <PermCheckRow checked={lead.mandatoryReqBeforeSiteVisit} onChange={(v) => setLead((p) => ({ ...p, mandatoryReqBeforeSiteVisit: v }))} label="Mandatory complete requirement form before site visit Completed." />
                <PermCheckRow checked={lead.projectWiseRevisit} onChange={(v) => setLead((p) => ({ ...p, projectWiseRevisit: v }))} label="Enable project wise revisit tagging (e.g: site visit will be tagged as revisit only if lead has already visited for same project)" />
              </div>
            ) : null}

            {section === "Contact Management" ? (
              <div className="space-y-4">
                <PermCheckRow checked={contact.allowDuplicate} onChange={(v) => setContact((p) => ({ ...p, allowDuplicate: v }))} label="Allow Duplicate Contacts" />
                <PermCheckRow checked={contact.transferInactiveToAdmin} onChange={(v) => setContact((p) => ({ ...p, transferInactiveToAdmin: v }))} label="On unqualified/inactive Contact, transfer Contact from sales executive to admin." />
                <div className="max-w-md space-y-1">
                  <label className="block text-[11px] font-medium text-gray-600">Choose Admin</label>
                  <select
                    suppressHydrationWarning
                    value={contact.chooseAdmin}
                    onChange={(e) => setContact((p) => ({ ...p, chooseAdmin: e.target.value }))}
                    className="h-9 w-full rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                  >
                    {adminOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {section === "CP Management" ? (
              <div className="space-y-3">
                <PermCheckRow checked={cp.showUserWiseCp} onChange={(v) => setCp((p) => ({ ...p, showUserWiseCp: v }))} label="Show User Wise Channel Partner" />
                <PermCheckRow checked={cp.cpTaggingDurationLimit} onChange={(v) => setCp((p) => ({ ...p, cpTaggingDurationLimit: v }))} label="CP Tagging Duration Limit" />
                <PermCheckRow checked={cp.addSourcingManagerOnAssign} onChange={(v) => setCp((p) => ({ ...p, addSourcingManagerOnAssign: v }))} label="Add Sourcing Manager (when CP assign to Lead)" />
                <PermCheckRow checked={cp.removeSourcingManagerOnDelete} onChange={(v) => setCp((p) => ({ ...p, removeSourcingManagerOnDelete: v }))} label="Remove Sourcing Manager (CP deleted from lead)" />
                <PermCheckRow checked={cp.allowDuplicateCpAgentWise} onChange={(v) => setCp((p) => ({ ...p, allowDuplicateCpAgentWise: v }))} label="Allow Duplicate Channel Partners Sales Agent Wise" />
                <PermCheckRow checked={cp.removeSourcingWithoutSiteVisit} onChange={(v) => setCp((p) => ({ ...p, removeSourcingWithoutSiteVisit: v }))} label="Remove Sourcing Manager Without Site Visit" />
              </div>
            ) : null}

            {section === "Property Management" ? (
              <PermCheckRow checked={property.salesAgentWiseProperty} onChange={(v) => setProperty((p) => ({ ...p, salesAgentWiseProperty: v }))} label="Show sales agent wise property." />
            ) : null}

            {section === "Call Management" ? (
              <div className="space-y-4">
                <PermCheckRow checked={call.autoCallUpcomingTask} onChange={(v) => setCall((p) => ({ ...p, autoCallUpcomingTask: v }))} label="Auto Call/Dial all upcoming Task/Followup" />
                <PermCheckRow checked={call.autoDialNewLead} onChange={(v) => setCall((p) => ({ ...p, autoDialNewLead: v }))} label="Auto dial lead on new lead creation" />
                <PermCheckRow checked={call.autoDialDailyMissed} onChange={(v) => setCall((p) => ({ ...p, autoDialDailyMissed: v }))} label="Auto Dial Daily To Outgoing Missed Calls" />
                <PermCheckRow checked={call.ruleBasedCalling} onChange={(v) => setCall((p) => ({ ...p, ruleBasedCalling: v }))} label="Enable Rule Based Calling" />
                <PermCheckRow checked={call.compulsoryFeedback} onChange={(v) => setCall((p) => ({ ...p, compulsoryFeedback: v }))} label="Show compulsory feedback form after every call" />
                <div className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-600">Auto Dialer Contact Waiting Time (In Seconds)</label>
                    <input
                      suppressHydrationWarning
                      value={call.contactWaitSeconds}
                      onChange={(e) => setCall((p) => ({ ...p, contactWaitSeconds: e.target.value }))}
                      className="h-9 w-full rounded border border-gray-300 px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-600">Auto Dialer Lead Waiting Time (In Seconds)</label>
                    <input
                      suppressHydrationWarning
                      value={call.leadWaitSeconds}
                      onChange={(e) => setCall((p) => ({ ...p, leadWaitSeconds: e.target.value }))}
                      className="h-9 w-full rounded border border-gray-300 px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end border-t border-gray-200 px-4 py-3">
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
