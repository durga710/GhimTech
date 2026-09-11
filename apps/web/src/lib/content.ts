export const modules = [
  {
    name: "Business software",
    category: "Custom Business Software",
    title: "One place to run the work.",
    description:
      "Bring records, responsibilities, and the next action into a system built around your operation.",
    steps: ["Intake", "Assign an owner", "Move work forward", "Review exceptions"],
    detail:
      "The workflow decides the software. Every record has a purpose, an owner, and a next step.",
  },
  {
    name: "CRM systems",
    category: "Custom CRM",
    title: "Relationships with context.",
    description:
      "Keep the details that matter to your business, from the first conversation to an ongoing relationship.",
    steps: ["Enquiry", "Qualify", "Follow up", "Customer record"],
    detail:
      "A pipeline should reflect your sales process, with the right information available at each handoff.",
  },
  {
    name: "Automation",
    category: "Workflow Automation",
    title: "Follow-up without the chasing.",
    description:
      "Turn recurring tasks and handoffs into repeatable workflows, with clear rules and a human path for exceptions.",
    steps: ["Trigger", "Check the rules", "Notify the right person", "Track the response"],
    detail: "People remain in control. An exception should reach someone who can resolve it.",
  },
  {
    name: "Internal tools",
    category: "Internal Tools",
    title: "Give the team a better way.",
    description:
      "Replace a fragile spreadsheet process with an internal tool that makes responsibilities and status clear.",
    steps: ["Request", "Review", "Approve", "Record decision"],
    detail:
      "Permissions, ownership, and an audit trail are part of the workflow from the beginning.",
  },
  {
    name: "AI-assisted tools",
    category: "AI-Assisted Tools",
    title: "Help with the information work.",
    description:
      "Extract, find, or summarize information where assistance makes a task easier. Keep review at the point of decision.",
    steps: ["Source document", "Extract information", "Human review", "Approved record"],
    detail:
      "Use source material, show uncertainty, and require review before important information changes.",
  },
  {
    name: "Dashboards",
    category: "Business Dashboards",
    title: "See what needs attention.",
    description:
      "Connect operational data to useful views of workload, overdue tasks, and exceptions.",
    steps: ["Operational records", "Shared definitions", "Exception view", "Take action"],
    detail: "A useful dashboard answers a decision, rather than filling a screen with numbers.",
  },
  {
    name: "Client portals",
    category: "Client Portals",
    title: "A clear next step for customers.",
    description:
      "Give customers a place to submit information, share documents, and understand what happens next.",
    steps: ["Secure access", "Submit information", "Review request", "Status update"],
    detail:
      "Clear instructions and recoverable errors make a portal useful for people who visit only occasionally.",
  },
  {
    name: "Employee portals",
    category: "Employee Portals",
    title: "The essentials, within reach.",
    description:
      "Bring employee information, documents, requests, and communication into a purpose-built workspace.",
    steps: ["Employee access", "Required action", "Admin review", "Record updated"],
    detail: "Design for a busy employee on a phone as carefully as for an administrator at a desk.",
  },
  {
    name: "Integrations",
    category: "System Integrations",
    title: "Let the information travel.",
    description:
      "Connect tools that still serve the business and reduce repeated entry between systems.",
    steps: ["Source system", "Validate and map", "Destination system", "Reconcile"],
    detail:
      "Reliable integrations need retry rules, duplicate protection, and a visible path for failed transfers.",
  },
];
export const processSteps = [
  [
    "Understand",
    "Start where the work happens.",
    "Walk through a normal day, an unusual day, and the steps someone has to remember. Talk to the people doing the work.",
    "People + context",
  ],
  [
    "Map",
    "Make the invisible work visible.",
    "Document who does what, what information they need, and where a handoff gets delayed.",
    "Workflow + dependencies",
  ],
  [
    "Simplify",
    "Remove steps before adding software.",
    "Question duplicate entry and unnecessary approvals. Decide what to build and which existing tools should stay.",
    "Fewer steps + clear ownership",
  ],
  [
    "Build",
    "Turn the workflow into a working system.",
    "Design, engineer, and review the software against real tasks. Handle missing information and exceptions deliberately.",
    "Product + real-world testing",
  ],
  [
    "Integrate",
    "Connect what already works.",
    "Bring useful tools together with explicit data ownership, failure handling, and a practical migration plan.",
    "Connected tools + reliable data",
  ],
  [
    "Improve",
    "Keep the system close to the business.",
    "Use feedback from the people operating it to refine the product as responsibilities and workflows change.",
    "Feedback + ongoing development",
  ],
];
export const services = [
  [
    "Our business is running from spreadsheets.",
    "A centralized operations system",
    "Connect records, responsibilities, and status in one workspace. Keep the flexibility that matters and remove the manual work that does not.",
    ["Custom business software", "Internal tools"],
  ],
  [
    "Our CRM doesn’t fit our workflow.",
    "A CRM shaped around the company",
    "Map your relationships and handoffs first. Then customize an existing CRM or build the specific system the business needs.",
    ["CRM implementation", "Custom CRM"],
  ],
  [
    "Our employees constantly need reminders.",
    "A repeatable communication workflow",
    "Connect a clear trigger to the right person, message, and follow-up. Give administrators visibility when a response is still needed.",
    ["Notifications", "Workflow automation"],
  ],
  [
    "We enter the same information in multiple systems.",
    "Connected tools and consistent records",
    "Define which system owns each record, connect the right data, and make failed transfers visible so the team can resolve them.",
    ["System integrations", "Data workflows"],
  ],
  [
    "Our employees need a portal.",
    "A workspace for the people doing the work",
    "Organize employee information, documents, and requests around the tasks people need to complete.",
    ["Employee portals", "Internal platforms"],
  ],
  [
    "Customers need to send information and documents.",
    "A guided intake experience",
    "Make it clear what is needed, what has been received, and what happens next. Design review and follow-up into the process.",
    ["Client portals", "Document workflows"],
  ],
  [
    "Management doesn’t have visibility.",
    "Reporting tied to real decisions",
    "Agree on useful definitions and connect operational data to views that reveal overdue work, exceptions, and ownership.",
    ["Business dashboards", "Reporting systems"],
  ],
  [
    "Our team spends too much time on repetitive admin.",
    "A simpler way through the work",
    "Map the process before automating it. Use rules for predictable steps and AI assistance only where it has a clear role.",
    ["Process design", "AI-assisted tools"],
  ],
];
export type CaseStudy = {
  slug: string;
  company: string;
  industry: string;
  title: string;
  description: string;
  problem: string;
  system: string;
  capabilities: string[];
  screenshots: { src: string; alt: string }[];
  workflow: string[];
  technology: string[];
  results: string[];
  relatedProjects: string[];
};
export const projects: CaseStudy[] = [
  {
    slug: "cyanjel-homecare",
    company: "CyanjelHomeCare LLC",
    industry: "Home care operations",
    title: "The systems behind the care.",
    description:
      "CyanjelHomeCare LLC is fully powered by GhimTech. An ongoing technology relationship built around the realities of a home care business.",
    problem:
      "Home care involves caregivers, clients, changing schedules, documentation, and administrative follow-up. The work crosses roles and locations, so a missed handoff can create more work elsewhere.",
    system:
      "GhimTech creates software and workflows around CyanjelHomeCare’s operations. The starting point is the work itself: how people coordinate, how information moves, and what administration needs to see.",
    capabilities: [],
    screenshots: [],
    workflow: [
      "Caregivers & clients",
      "Schedules & visits",
      "Communication",
      "Administrative review",
      "Documentation",
      "Operational visibility",
    ],
    technology: [],
    results: [],
    relatedProjects: [],
  },
];
export const articles = [
  {
    slug: "before-you-replace-the-spreadsheet",
    title: "Before you replace the spreadsheet, understand the job it does.",
    category: "Business systems",
    readTime: "5 min read",
    description:
      "A practical way to decide which parts of a spreadsheet workflow deserve to become software.",
    sections: [
      [
        "Start with one record",
        "Choose a real piece of work: an enquiry, employee request, or customer document. Follow it from arrival to completion. Note every place someone copies information, checks a status, or asks a colleague what to do. The spreadsheet may be doing several jobs at once: database, task list, reporting tool, and informal process manual.",
      ],
      [
        "Separate the data from the decisions",
        "List the information that must remain accurate, then list the decisions people make with it. A customer address is a record. Deciding who should follow up is a workflow rule. A replacement becomes easier to reason about when these responsibilities are explicit.",
      ],
      [
        "Find the hidden rules",
        "Ask what happens when an entry is incomplete, two people edit it, or the person who normally manages it is away. These exceptions often explain why a spreadsheet looks complicated. They belong in the requirements, not in a future backlog that everyone hopes to avoid.",
      ],
      [
        "Choose a narrow first release",
        "Start with one workflow that has a clear beginning, owner, and completion state. Agree on what the new system must do before switching over. Export the original data, rehearse a migration, and decide how to recover if a record is missing or a rule is wrong.",
      ],
      [
        "Know when to leave it alone",
        "A small, occasional analysis may work perfectly well in a spreadsheet. Replacement becomes more useful when several people depend on shared status, controlled access, repeatable handoffs, or reliable history. The aim is a more dependable operation. A custom application is one possible means.",
      ],
      [
        "A useful first exercise",
        "Write down five things: the record being tracked, the person responsible, the next action, the condition for completion, and the common exception. If the team cannot agree on those, clarify the process before commissioning software.",
      ],
    ],
  },
  {
    slug: "automate-the-handoff",
    title: "Automate the handoff. Keep a person responsible.",
    category: "Workflow design",
    readTime: "4 min read",
    description:
      "The trigger is only the beginning. Good automation makes ownership, exceptions, and recovery visible.",
    sections: [
      [
        "A notification is not a completed workflow",
        "Sending a message can be a useful step, but it does not tell you whether the recipient understood it or acted. Design the workflow around the result that matters. Name the action required, the owner, and the condition that marks the work complete.",
      ],
      [
        "Define the trigger precisely",
        "A vague rule such as “send a reminder when something is late” hides important decisions. Which deadline? Which timezone? What if the task was completed but the source system is delayed? Write these conditions down before connecting a messaging service.",
      ],
      [
        "Make repetition safe",
        "Retries are normal in connected systems. A service can receive a request even when its response gets lost. Use a stable identifier for the action so a retry does not create a second task or send a second message. Keep a record of what the workflow attempted and what the receiving system acknowledged.",
      ],
      [
        "Give exceptions a destination",
        "When an address is wrong, information is missing, or a person cannot complete the task, assign the exception to someone who can help. A queue that nobody owns becomes another workaround. The administrator should see the reason, the relevant context, and the next available action.",
      ],
      [
        "Review the right signals",
        "Review unresolved exceptions, repeated failures, and work that still needs manual intervention. These tell you where the process needs attention. A large count of messages sent is less useful if the underlying work remains incomplete.",
      ],
    ],
  },
  {
    slug: "build-buy-or-connect",
    title: "Build, buy, or connect? Start with the workflow.",
    category: "Product decisions",
    readTime: "4 min read",
    description:
      "A decision framework for choosing software without making the business harder to operate.",
    sections: [
      [
        "Distinguish common work from distinctive work",
        "Some needs are shared by many businesses. Others depend on a particular operating model, handoff, or information structure. Describe the workflow in plain language before comparing products. That gives you a basis for judging fit.",
      ],
      [
        "Test an existing product with real scenarios",
        "Use a normal case, an exception, and an incomplete record. Ask the people who will use it to carry each scenario through. Notice where they need side notes, duplicate entry, or a separate spreadsheet. Those workarounds are part of the real cost.",
      ],
      [
        "Connect when the tools already do their jobs",
        "Replacing a useful product can add migration and maintenance work without improving operations. An integration may be enough when the main problem is information moving between tools. Confirm API access, data ownership, error handling, and export options before relying on that connection.",
      ],
      [
        "Build when the workflow warrants it",
        "Custom software is worth considering when the process is important, existing products create persistent workarounds, and the business can support ongoing ownership. Budget for maintenance, user feedback, monitoring, and changes after launch.",
      ],
      [
        "Compare the whole operating cost",
        "Look beyond the subscription or initial build price. Include migration, training, duplicated work, integration upkeep, support, and the cost of leaving later. Write down the tradeoffs and the conditions that would make you revisit the decision.",
      ],
    ],
  },
];
