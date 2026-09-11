"use client";
import { useState } from "react";
import { modules, processSteps } from "@/lib/content";
export function WorkflowHero() {
  const [organized, setOrganized] = useState(true);
  return (
    <div className={"workflow-hero " + (organized ? "organized" : "fragmented")}>
      <div className="diagram-heading">
        <span>THE OPERATION, CONNECTED</span>
        <span aria-hidden="true">01 / 03</span>
      </div>
      <div className="diagram-mode" aria-label="Workflow view">
        <button aria-pressed={!organized} onClick={() => setOrganized(false)}>
          Before
        </button>
        <button aria-pressed={organized} onClick={() => setOrganized(true)}>
          With GhimTech
        </button>
      </div>
      <div className="orbit">
        <svg className="orbit-lines" viewBox="0 0 480 360" aria-hidden="true">
          <path d="M95 60L240 180L390 65M65 180H420M95 300L240 180L390 300" />
          <circle cx="240" cy="180" r="93" />
        </svg>
        {(organized
          ? ["Clients", "Employees", "Documents", "Communication", "Workflows", "Reporting"]
          : [
              "Spreadsheet",
              "Phone calls",
              "Paper forms",
              "Text messages",
              "Email",
              "Another spreadsheet",
            ]
        ).map((item, i) => (
          <span className={"orbit-node node-" + i} key={i}>
            <span className="node-symbol" aria-hidden="true">
              {["↗", "↔", "≡", "↗", "⌁", "▤"][i]}
            </span>
            {item}
          </span>
        ))}
        <div className="orbit-core">
          <span className="core-monogram">G.</span>
          <strong>{organized ? "GhimTech" : "Manual work"}</strong>
          <span>{organized ? "Your operational system" : "You connect the dots"}</span>
        </div>
      </div>
      <div className="diagram-caption" aria-live="polite">
        <span className="status-dot" />
        {organized
          ? "Clear ownership. Connected information."
          : "Disconnected tools. Repeated follow-up."}
      </div>
      <p className="diagram-note">Illustrative system map</p>
    </div>
  );
}
export function ModuleExplorer() {
  const [index, setIndex] = useState(0);
  const item = modules[index];
  return (
    <div className="module-explorer">
      <div className="module-list" aria-label="Explore what we build">
        {modules.map((m, i) => (
          <button
            key={m.name}
            aria-pressed={index === i}
            aria-controls="module-detail"
            onClick={() => setIndex(i)}
          >
            <span className="module-number">{String(i + 1).padStart(2, "0")}</span>
            {m.name}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="module-detail" id="module-detail">
        <div className="diagram-heading">
          <span>{item.category}</span>
          <span>WORKFLOW CONCEPT</span>
        </div>
        <div className="module-stage">
          <div className="module-start">
            <span aria-hidden="true">↳</span> {item.steps[0]}
          </div>
          <div className="module-connector" />
          <div className="module-system">
            <span className="mini-label">PURPOSE-BUILT SYSTEM</span>
            <strong>{item.steps[1]}</strong>
            <div className="module-branch">
              <span>{item.steps[2]}</span>
              <span>{item.steps[3]}</span>
            </div>
          </div>
        </div>
        <div className="module-copy" aria-live="polite">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p className="small-copy">{item.detail}</p>
        </div>
      </div>
    </div>
  );
}
export function Process() {
  const [index, setIndex] = useState(0);
  return (
    <div className="process">
      <div className="process-nav" aria-label="Explore our process">
        {processSteps.map((s, i) => (
          <button
            key={s[0]}
            aria-pressed={index === i}
            aria-controls="process-detail"
            onClick={() => setIndex(i)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s[0]}
          </button>
        ))}
      </div>
      <div className="process-detail" id="process-detail">
        <span className="process-big" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div aria-live="polite">
          <p className="eyebrow">{processSteps[index][3]}</p>
          <h3>{processSteps[index][1]}</h3>
          <p>{processSteps[index][2]}</p>
        </div>
      </div>
    </div>
  );
}
const systemDetails = [
  [
    "Caregivers & clients",
    "Start with the people",
    "Understand who needs information, who is responsible for the work, and how a person gets help.",
  ],
  [
    "Schedules & visits",
    "Work changes during the day",
    "Schedules and visit-related processes introduce dependencies that the administrative workflow needs to account for.",
  ],
  [
    "Communication",
    "Give each handoff context",
    "A useful message makes the required action clear and gives the recipient a way to respond.",
  ],
  [
    "Administrative review",
    "Keep people in control",
    "Exceptions need a responsible person and enough context to make a decision.",
  ],
  [
    "Documentation",
    "Keep the record with the work",
    "Information should remain connected to the process it supports, with appropriate access.",
  ],
  [
    "Operational visibility",
    "See what needs attention",
    "Bring status and responsibility into view so the team knows where to act next.",
  ],
];
export function CareSystem() {
  const [index, setIndex] = useState(0);
  return (
    <div className="care-system">
      <div className="diagram-heading">
        <span>CYANJELHOMECARE / OPERATIONAL CONTEXT</span>
        <span>SYSTEM MAP</span>
      </div>
      <div className="care-system-body">
        <div className="care-path">
          {systemDetails.map((s, i) => (
            <button
              key={s[0]}
              aria-pressed={index === i}
              aria-controls="care-detail"
              onClick={() => setIndex(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s[0]}
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
        <div className="care-detail" id="care-detail" aria-live="polite">
          <span className="care-detail-index">{String(index + 1).padStart(2, "0")}</span>
          <h3>{systemDetails[index][1]}</h3>
          <p>{systemDetails[index][2]}</p>
          <span className="mini-label">THE WORKFLOW GUIDES THE SOFTWARE</span>
        </div>
      </div>
      <p className="diagram-note">
        A map of the operating environment, not a product screenshot or feature inventory.
      </p>
    </div>
  );
}
export function Transformation() {
  const [after, setAfter] = useState(true);
  const steps = after
    ? [
        "A request enters the system",
        "An owner and next action are assigned",
        "Relevant instructions stay with the request",
        "Status is visible to administration",
        "Exceptions go to a person who can help",
      ]
    : [
        "A request arrives in an email",
        "Details are copied into a spreadsheet",
        "Someone messages a colleague",
        "A phone call establishes the status",
        "The administrator follows up again",
      ];
  return (
    <div className="transformation">
      <div>
        <p className="eyebrow">Illustrative workflow</p>
        <h3>
          The handoff is
          <br />
          part of the product.
        </h3>
        <p>Follow one administrative request from arrival to resolution.</p>
        <div className="segmented">
          <button aria-pressed={!after} onClick={() => setAfter(false)}>
            Disconnected
          </button>
          <button aria-pressed={after} onClick={() => setAfter(true)}>
            Connected
          </button>
        </div>
      </div>
      <ol className={after ? "transform-steps connected" : "transform-steps"} aria-live="polite">
        {steps.map((s, i) => (
          <li key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
