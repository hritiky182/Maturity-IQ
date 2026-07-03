// Mock data for Organizational Maturity Assessment Tool

export type MaturityLevel = "Initial" | "Developing" | "Defined" | "Managed" | "Optimized";

export interface Question {
  id: string;
  text: string;
  description: string;
  type: "rating" | "yesno" | "single" | "multi" | "text";
  score: number; // 1-5, 0 = unanswered
}

export interface Section {
  id: string;
  name: string;
  questions: Question[];
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  sections: Section[];
}

export interface Assessment {
  id: string;
  name: string;
  company: string;
  status: "Draft" | "In Progress" | "Completed" | "Archived";
  createdAt: string;
  updatedAt: string;
  overallScore: number;
  completion: number;
  year: number;
  departments: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  timeline: string;
  department: string;
}

export interface RoadmapItem {
  id: string;
  initiative: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  timeline: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  status: "Not Started" | "In Progress" | "On Hold" | "Completed";
  progress: number;
  department: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  revenue: string;
  type: string;
}

export const DEPARTMENT_DEFS = [
  { id: "strategy", name: "Strategy", icon: "Target",
    sections: ["Strategic Planning", "Vision Alignment", "KPI Management", "Governance", "Performance Tracking"] },
  { id: "hr", name: "Human Resources", icon: "Users",
    sections: ["Recruitment", "Talent Management", "Learning & Development", "Performance Management", "Succession Planning"] },
  { id: "innovation", name: "Innovation", icon: "Lightbulb",
    sections: ["Digital Innovation", "Product Innovation", "R&D", "Change Management", "Technology Adoption"] },
  { id: "it", name: "Information Technology", icon: "Cpu",
    sections: ["Infrastructure", "Cybersecurity", "Data Management", "Enterprise Systems", "IT Governance"] },
  { id: "legal", name: "Legal & Compliance", icon: "Scale",
    sections: ["Regulatory Compliance", "Contract Management", "Litigation", "Policies", "Ethics"] },
  { id: "risk", name: "Risk Management", icon: "ShieldAlert",
    sections: ["Risk Identification", "Risk Assessment", "Mitigation", "Business Continuity", "Reporting"] },
  { id: "operations", name: "Operations", icon: "Settings2",
    sections: ["Process Management", "Quality Management", "Operational Efficiency", "Vendor Management", "Service Delivery"] },
  { id: "pm", name: "Project Management", icon: "KanbanSquare",
    sections: ["Project Governance", "Resource Planning", "Delivery Management", "Risk Tracking", "Reporting"] },
  { id: "finance", name: "Finance", icon: "Wallet",
    sections: ["Budgeting", "Financial Reporting", "Treasury", "Audit", "Financial Planning"] },
  { id: "sales", name: "Sales & Marketing", icon: "Megaphone",
    sections: ["Brand Strategy", "Lead Generation", "Sales Enablement", "Customer Insights", "Digital Marketing"] },
  { id: "procurement", name: "Procurement", icon: "ShoppingCart",
    sections: ["Sourcing", "Supplier Management", "Contract Negotiation", "Spend Analysis", "Sustainability"] },
  { id: "cx", name: "Customer Experience", icon: "Heart",
    sections: ["Customer Journey", "Feedback Systems", "Service Standards", "Loyalty Programs", "Complaint Management"] },
];

const SAMPLE_QUESTIONS = [
  "Is there a formal framework defined and documented for this capability?",
  "Are roles and responsibilities clearly assigned across the organization?",
  "How mature is measurement and reporting in this area?",
  "Are continuous improvement processes established and followed?",
  "How well is this capability integrated with organizational strategy?",
];

function seedScore(seed: number): number {
  // deterministic pseudo-random 1-5
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.max(1, Math.min(5, Math.round(1 + r * 4)));
}

export function buildDepartments(): Department[] {
  let qid = 0;
  return DEPARTMENT_DEFS.map((d, di) => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    sections: d.sections.map((sname, si) => ({
      id: `${d.id}-s${si}`,
      name: sname,
      questions: SAMPLE_QUESTIONS.map((q, qi) => {
        qid++;
        return {
          id: `${d.id}-s${si}-q${qi}`,
          text: `${sname}: ${q}`,
          description:
            "Rate the current maturity of this capability across your real estate development organization.",
          type: "rating" as const,
          score: seedScore(di * 100 + si * 10 + qi + 1),
        };
      }),
    })),
  }));
}

const COMPANIES = [
  "Emaar Holdings", "Dar Al Arkan", "DAMAC Properties", "Nakheel Group", "Aldar Properties",
  "Meraas", "Sobha Realty", "Deyaar Development", "Union Properties", "Azizi Developments",
  "Ellington Properties", "Binghatti Developers", "Danube Properties", "Select Group", "Omniyat",
  "MAG Property", "Reportage Properties", "Bloom Holding", "Modon Properties", "Imkan",
  "Diyar Al Muharraq", "Kingdom Holding", "Roshn", "NHC Real Estate", "Retal Urban",
];

const YEARS = [2023, 2024, 2025, 2026];
const STATUSES: Assessment["status"][] = ["Draft", "In Progress", "Completed", "Archived"];

export const MOCK_ORGANIZATIONS: Organization[] = Array.from({ length: 50 }, (_, i) => ({
  id: `org-${i + 1}`,
  name: COMPANIES[i % COMPANIES.length] + (i >= COMPANIES.length ? ` ${Math.floor(i / COMPANIES.length) + 1}` : ""),
  industry: "Real Estate Development",
  country: ["UAE", "KSA", "Qatar", "Kuwait", "Bahrain", "Oman"][i % 6],
  employees: 200 + (i * 137) % 5000,
  revenue: `$${(50 + (i * 23) % 950)}M`,
  type: ["Public", "Private", "Family Office", "JV"][i % 4],
}));

export const MOCK_ASSESSMENTS: Assessment[] = Array.from({ length: 40 }, (_, i) => {
  const status = STATUSES[i % STATUSES.length];
  const completion = status === "Completed" ? 100 : status === "Draft" ? 5 + (i * 7) % 25 : 30 + (i * 11) % 60;
  const overall = 1.8 + ((i * 0.17) % 3.1);
  return {
    id: `ASM-${1000 + i}`,
    name: `Annual Maturity Assessment ${YEARS[i % 4]}`,
    company: MOCK_ORGANIZATIONS[i % MOCK_ORGANIZATIONS.length].name,
    status,
    createdAt: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    updatedAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    overallScore: Math.round(overall * 10) / 10,
    completion,
    year: YEARS[i % 4],
    departments: DEPARTMENT_DEFS.slice(0, 6 + (i % 7)).map((d) => d.id),
  };
});

const REC_TEMPLATES = [
  { dep: "strategy", title: "Establish Strategic Planning Framework",
    desc: "Formalize a quarterly strategic planning and KPI review cadence with clear ownership and cascading objectives across business units." },
  { dep: "operations", title: "Standardize Operational SOPs",
    desc: "Implement standardized SOPs across construction, sales handover, and property management with automation of repetitive workflows." },
  { dep: "innovation", title: "Digital Transformation Program",
    desc: "Launch an enterprise-wide digital transformation program covering BIM, PropTech, and AI-driven analytics for real estate operations." },
  { dep: "hr", title: "Talent & Succession Planning",
    desc: "Deploy a formal talent review and succession planning process for critical development, design, and delivery leadership roles." },
  { dep: "it", title: "Cybersecurity Maturity Uplift",
    desc: "Adopt ISO 27001 controls and a zero-trust architecture to protect tenant, buyer, and financial systems from evolving threats." },
  { dep: "risk", title: "Enterprise Risk Management",
    desc: "Roll out an ERM framework with quantified risk registers for market, delivery, financial, and regulatory exposures." },
  { dep: "finance", title: "Integrated Financial Planning",
    desc: "Move from spreadsheet-based planning to an integrated FP&A platform with scenario modeling for project-level cashflows." },
  { dep: "pm", title: "Project Governance Uplift",
    desc: "Establish a PMO with standardized gate reviews, resource loading, and portfolio dashboards for all active developments." },
  { dep: "sales", title: "Digital Sales & CRM",
    desc: "Deploy an integrated CRM and digital sales funnel with lead scoring, broker portals, and personalized nurture journeys." },
  { dep: "cx", title: "Customer Journey Redesign",
    desc: "Redesign the buyer and tenant journey with NPS instrumentation, SLA-backed service standards, and closed-loop feedback." },
  { dep: "procurement", title: "Category Sourcing Strategy",
    desc: "Introduce category management, e-sourcing, and supplier performance scorecards to unlock savings and de-risk delivery." },
  { dep: "legal", title: "Contract Lifecycle Management",
    desc: "Implement a CLM platform with clause library, obligation tracking, and automated escalations across contracting stakeholders." },
];

const PRIORITIES: Recommendation["priority"][] = ["Critical", "High", "Medium", "Low"];
const IMPACTS: Recommendation["impact"][] = ["High", "Medium", "Low"];
const TIMELINES = ["0-3 months", "3-6 months", "6-12 months", "12-18 months"];

export const MOCK_RECOMMENDATIONS: Recommendation[] = Array.from({ length: 24 }, (_, i) => {
  const t = REC_TEMPLATES[i % REC_TEMPLATES.length];
  return {
    id: `REC-${100 + i}`,
    title: t.title,
    description: t.desc,
    priority: PRIORITIES[i % 4],
    impact: IMPACTS[i % 3],
    timeline: TIMELINES[i % 4],
    department: DEPARTMENT_DEFS.find((d) => d.id === t.dep)?.name || "Strategy",
  };
});

const ROADMAP_STATUSES: RoadmapItem["status"][] = ["Not Started", "In Progress", "On Hold", "Completed"];
const OWNERS = ["Sarah Malik", "Ahmed Al Nuaimi", "Karim Haddad", "Layla Farouk", "Omar Zaidan", "Noor Khoury"];

export const MOCK_ROADMAP: RoadmapItem[] = Array.from({ length: 20 }, (_, i) => {
  const t = REC_TEMPLATES[i % REC_TEMPLATES.length];
  const status = ROADMAP_STATUSES[i % 4];
  return {
    id: `INI-${200 + i}`,
    initiative: t.title,
    priority: PRIORITIES[i % 4],
    owner: OWNERS[i % OWNERS.length],
    timeline: TIMELINES[i % 4],
    quarter: (["Q1", "Q2", "Q3", "Q4"] as const)[i % 4],
    status,
    progress: status === "Completed" ? 100 : status === "Not Started" ? 0 : 15 + (i * 13) % 70,
    department: DEPARTMENT_DEFS.find((d) => d.id === t.dep)?.name || "Strategy",
  };
});

export const CURRENT_ORG: Organization = MOCK_ORGANIZATIONS[0];

export const DEPARTMENTS_WITH_SCORES = buildDepartments();
