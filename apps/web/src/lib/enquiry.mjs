export const budgets = [
  "Not sure yet",
  "Under $5,000",
  "$5,000–$15,000",
  "$15,000–$40,000",
  "$40,000+",
];
export const timelines = [
  "Exploring options",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Flexible",
];
const limits = {
  name: 120,
  email: 254,
  company: 160,
  website: 500,
  business: 2000,
  bottleneck: 3000,
  currentProcess: 3000,
  idealSystem: 3000,
  budget: 50,
  timeline: 50,
  context: 3000,
};
export function validateEnquiry(input) {
  const data = {};
  const errors = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { data, errors: { form: "Please enter your project details." } };
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key];
    if (value !== undefined && typeof value !== "string") {
      errors[key] = "Please enter text.";
      continue;
    }
    data[key] = (value || "").trim();
    if (data[key].length > max) errors[key] = "Please use " + max + " characters or fewer.";
    // eslint-disable-next-line no-control-regex -- Reject non-printing input characters.
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(data[key]))
      errors[key] = "Please remove unsupported characters.";
  }
  for (const key of [
    "name",
    "email",
    "company",
    "business",
    "bottleneck",
    "currentProcess",
    "idealSystem",
  ])
    if (!data[key]) errors[key] = "Please complete this field.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email address.";
  if (data.website) {
    try {
      const url = new URL(data.website);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        !url.hostname.includes(".")
      )
        throw new Error();
    } catch {
      errors.website = "Enter a complete website address, such as https://company.com.";
    }
  }
  if (data.budget && !budgets.includes(data.budget))
    errors.budget = "Choose a budget range from the list.";
  if (data.timeline && !timelines.includes(data.timeline))
    errors.timeline = "Choose a timeline from the list.";
  return { data, errors };
}
