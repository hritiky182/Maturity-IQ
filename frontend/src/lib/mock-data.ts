// Industry-Agnostic mock data for Organizational Maturity Assessment Tool

export type MaturityLevel = "Initial" | "Developing" | "Defined" | "Managed" | "Optimized";

export interface Question {
  id: string;
  text: string;
  description: string;
  type: "rating" | "yesno" | "single" | "multi" | "text";
  score: number; // 1-5, 0 = unanswered
  choices?: string[];
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

// Type alias for modern industry-agnostic naming
export type BusinessFunction = Department;

export interface Assessment {
  id: string;
  name: string;
  company: string; // Acts as Organization Name
  status: "Draft" | "In Progress" | "Completed" | "Submitted" | "Archived";
  createdAt: string;
  updatedAt: string;
  overallScore: number;
  completion: number;
  year: number;
  industry: string; // Industry Template ID: "realestate" | "healthcare" | "government" | "education" | "general"
  departments: string[]; // Active function IDs
  sponsor?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  timeline: string;
  department: string; // Business Function Name
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
  department: string; // Business Function Name
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  revenue: string;
  type: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  assessmentYear?: number;
}

// 8 Configurable Business Functions
export const FUNCTION_DEFS = [
  { id: "strategy", name: "Strategy", icon: "Target" },
  { id: "hr", name: "Human Resources", icon: "Users" },
  { id: "innovation", name: "Innovation", icon: "Lightbulb" },
  { id: "it", name: "Information Technology", icon: "Cpu" },
  { id: "legal", name: "Legal & Compliance", icon: "Scale" },
  { id: "risk", name: "Risk Management", icon: "ShieldAlert" },
  { id: "operations", name: "Operations", icon: "Settings2" },
  { id: "pm", name: "Project Management", icon: "KanbanSquare" },
];

export interface FunctionDef {
  id: string;
  name: string;
  icon: string;
  sections: string[];
}

export interface IndustryTemplate {
  id: string;
  name: string;
  functions: FunctionDef[];
}

// Templates for 5 major industry types
export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "realestate",
    name: "Real Estate",
    functions: FUNCTION_DEFS.map((f) => {
      let sections: string[] = [];
      if (f.id === "strategy") sections = ["Strategic Planning", "Market Research", "Land Acquisition", "Portfolio Strategy", "Executive KPIs"];
      else if (f.id === "hr") sections = ["Recruitment", "Talent Management", "Retention", "Safety Standards", "Performance Incentives"];
      else if (f.id === "innovation") sections = ["Digital Adoption", "PropTech Integration", "Smart Buildings", "BIM", "R&D"];
      else if (f.id === "it") sections = ["Infrastructure", "Cybersecurity", "CRM", "ERP", "Cloud Adoption"];
      else if (f.id === "legal") sections = ["Zoning & Land Use", "Contracting", "Regulatory Filings", "Ethics", "Compliance Audits"];
      else if (f.id === "risk") sections = ["Financial Risk", "Construction Safety", "Market Fluctuation", "Resource Scarcity", "Liability"];
      else if (f.id === "operations") sections = ["Asset Management", "Property Management", "Tenant Relations", "Facility Management", "Utility Operations"];
      else sections = ["Development PMO", "Site Controls", "Cost Engineering", "Scheduling", "Handover Quality"];
      return { ...f, sections };
    }),
  },
  {
    id: "healthcare",
    name: "Healthcare",
    functions: FUNCTION_DEFS.map((f) => {
      let sections: string[] = [];
      if (f.id === "strategy") sections = ["Clinical Strategy", "Patient Experience Plan", "Funding & Grants", "Partnerships", "Growth"];
      else if (f.id === "hr") sections = ["Clinical Staffing", "Nurse Retention", "Medical Training", "Shift Scheduling", "Wellness"];
      else if (f.id === "innovation") sections = ["Telehealth Adoption", "Electronic Health Records", "Medical Devices", "AI Diagnostics", "Medical Research"];
      else if (f.id === "it") sections = ["HIPAA Compliance", "Patient Portals", "Network Uptime", "Security Audits", "Integration"];
      else if (f.id === "legal") sections = ["Patient Rights", "Medical Malpractice", "Healthcare Compliance", "Billing Audits", "Licensing"];
      else if (f.id === "risk") sections = ["Clinical Risks", "Patient Safety", "Data Privacy", "Infection Control", "Emergency Preparedness"];
      else if (f.id === "operations") sections = ["Clinic Operations", "Patient Intake", "Lab Turnaround", "Supply Chain", "Facility Sterilization"];
      else sections = ["Equipment Upgrades", "Facility Expansions", "Compliance rollouts", "Clinical Studies", "Quality Assurance"];
      return { ...f, sections };
    }),
  },
  {
    id: "government",
    name: "Government",
    functions: FUNCTION_DEFS.map((f) => {
      let sections: string[] = [];
      if (f.id === "strategy") sections = ["Public Policy", "Inter-Agency Strategy", "Civic KPIs", "Budgeting Alignment", "Citizen Trust"];
      else if (f.id === "hr") sections = ["Civil Service Hiring", "Compensation Equity", "Public Sector Unions", "Training", "Retention"];
      else if (f.id === "innovation") sections = ["e-Government Portals", "Digital Identity", "Public-Private Partnerships", "Citizen feedback systems", "Smart Cities"];
      else if (f.id === "it") sections = ["Sovereign Cloud", "Cybersecurity", "Data Interoperability", "Legacy Migration", "IT Procurement"];
      else if (f.id === "legal") sections = ["Public Audits", "Freedom of Information", "Procurement Laws", "Anti-Corruption", "Regulatory Enforcement"];
      else if (f.id === "risk") sections = ["National Security", "Fiscal Soundness", "Disaster Resilience", "Public Trust Risk", "Policy Failures"];
      else if (f.id === "operations") sections = ["Public Service Delivery", "Citizen Support Center", "Social Welfare Payouts", "Utility Distribution", "Infrastructure Maintenance"];
      else sections = ["Public Works PMO", "Infrastructure Delivery", "Policy Rollouts", "Vendor Audits", "Budget Tracking"];
      return { ...f, sections };
    }),
  },
  {
    id: "education",
    name: "Education",
    functions: FUNCTION_DEFS.map((f) => {
      let sections: string[] = [];
      if (f.id === "strategy") sections = ["Academic Vision", "Accreditation Plan", "Student Enrollment", "Financial Sustainability", "Alumni Engagement"];
      else if (f.id === "hr") sections = ["Faculty Recruitment", "Professional Development", "Compensation", "Employee Retention", "Student Success Staff"];
      else if (f.id === "innovation") sections = ["EdTech Integration", "LMS Adoption", "Hybrid Learning Models", "Academic Research", "Creative Pedagogy"];
      else if (f.id === "it") sections = ["Campus Networks", "Student Information Systems", "Online Registration", "Cyber Protection", "Lab IT"];
      else if (f.id === "legal") sections = ["Title IX Compliance", "Accreditation Audits", "Student Privacy", "Labor Relations", "Policy Audits"];
      else if (f.id === "risk") sections = ["Campus Safety", "Financial Auditing", "Enrollment Volatility", "Emergency Response", "Cyber Risks"];
      else if (f.id === "operations") sections = ["Classroom Management", "Course Scheduling", "Student Services", "Housing & Facilities", "Auxiliary Services"];
      else sections = ["Curriculum Design", "Campus Construction", "Accreditation Prep", "System rollouts", "Institutional Studies"];
      return { ...f, sections };
    }),
  },
  {
    id: "general",
    name: "General Enterprise",
    functions: FUNCTION_DEFS.map((f) => {
      let sections: string[] = [];
      if (f.id === "strategy") sections = ["Strategic Vision", "OKR Framework", "Market Competitiveness", "Resource Allocation", "Business Model"];
      else if (f.id === "hr") sections = ["Recruiting Operations", "Employee Engagement", "Learning & Development", "Succession Planning", "Retention"];
      else if (f.id === "innovation") sections = ["Digital Transformation", "Product Development", "R&D Pipeline", "Agile Adoption", "Open Innovation"];
      else if (f.id === "it") sections = ["Cloud Infrastructure", "Cybersecurity Standards", "Enterprise ERP", "Business Intelligence", "Service Desk"];
      else if (f.id === "legal") sections = ["Corporate Governance", "Commercial Contracting", "IP Protection", "Regulatory Audits", "Privacy Compliance"];
      else if (f.id === "risk") sections = ["Operational Risks", "Cyber Vulnerability", "Business Continuity", "Compliance Audits", "Financial Hedging"];
      else if (f.id === "operations") sections = ["Process Automation", "Service Delivery SLAs", "Customer Support", "Supply Chain Logistics", "Quality Control"];
      else sections = ["Enterprise PMO", "Agile Delivery", "Resource Scheduling", "Project Dashboards", "Cost Control"];
      return { ...f, sections };
    }),
  },
];

// Helper to seed scores
function seedScore(seed: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.max(1, Math.min(5, Math.round(1 + r * 4)));
}

// Build default functions with scores for initial load
export function buildDepartments(): Department[] {
  const template = INDUSTRY_TEMPLATES[0]; // Real Estate default
  return template.functions.map((f, fi) => ({
    id: f.id,
    name: f.name,
    icon: f.icon,
    sections: f.sections.map((sname, si) => ({
      id: `${f.id}-s${si}`,
      name: sname,
      questions: Array.from({ length: 5 }).map((_, qi) => ({
        id: `realestate-${f.id}-s${si}-q${qi}`,
        text: `${sname}: Question ${qi + 1}`,
        description: "Rate the capability level of this organizational process parameter.",
        type: "rating" as const,
        score: seedScore(fi * 100 + si * 10 + qi + 1),
      })),
    })),
  }));
}

// Pool of 25 dynamic organizations in various industries
const ORGANIZATIONS_POOL = [
  { name: "Emaar Properties", industry: "Real Estate" },
  { name: "Cleveland Clinic Abu Dhabi", industry: "Healthcare" },
  { name: "Saudi Ministry of Health", industry: "Government" },
  { name: "Zayed University", industry: "Education" },
  { name: "SABIC Petrochemicals", industry: "Manufacturing" },
  { name: "Emirates NBD Bank", industry: "Banking & Finance" },
  { name: "G42 Cloud Systems", industry: "Technology" },
  { name: "McKinsey Middle East", industry: "Consulting" },
  { name: "Majid Al Futtaim Retail", industry: "Retail" },
  { name: "Aldar Properties", industry: "Real Estate" },
  { name: "King Faisal Specialist Hospital", industry: "Healthcare" },
  { name: "Dubai Municipality", industry: "Government" },
  { name: "King Saud University", industry: "Education" },
  { name: "Aramco Operations", industry: "Manufacturing" },
  { name: "Al Rajhi Corporate Bank", industry: "Banking & Finance" },
  { name: "AstraZeneca GCC", industry: "Healthcare" },
  { name: "Abu Dhabi Department of Education", industry: "Government" },
  { name: "American University of Sharjah", industry: "Education" },
  { name: "DP World Logistics", industry: "Manufacturing" },
  { name: "PwC Middle East", industry: "Consulting" },
  { name: "Carrefour GCC", industry: "Retail" },
  { name: "First Abu Dhabi Bank", industry: "Banking & Finance" },
  { name: "Microsoft Gulf", industry: "Technology" },
  { name: "Damac Properties", industry: "Real Estate" },
  { name: "Saudi Aramco Retail", industry: "Retail" }
];

export const MOCK_ORGANIZATIONS: Organization[] = Array.from({ length: 50 }, (_, i) => {
  const poolItem = ORGANIZATIONS_POOL[i % ORGANIZATIONS_POOL.length];
  const name = poolItem.name + (i >= ORGANIZATIONS_POOL.length ? ` ${Math.floor(i / ORGANIZATIONS_POOL.length) + 1}` : "");
  const country = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"][i % 6];
  const employees = 100 + (i * 183) % 15000;
  const revValue = 20 + (i * 47) % 5000;
  const revenue = revValue >= 1000 ? `$${(revValue / 1000).toFixed(1)}B` : `$${revValue}M`;
  const type = ["Public", "Private", "Government Entity", "Family Office"][i % 4];
  const contactPerson = ["Sarah Malik", "Ahmed Al Nuaimi", "Karim Haddad", "Layla Farouk", "Omar Zaidan", "Noor Khoury"][i % 6];
  
  return {
    id: `org-${i + 1}`,
    name,
    industry: poolItem.industry,
    country,
    employees,
    revenue,
    type,
    contactPerson,
    email: name === "Emaar Properties" ? "sarah.malik@maturityiq.com" : `${contactPerson.toLowerCase().replace(" ", ".")}@${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "org"}.com`,
    phone: `+971 50 ${1000000 + (i * 78243) % 8999999}`,
    assessmentYear: 2026,
  };
});

// Seed 40 initial assessments across templates
export const MOCK_ASSESSMENTS: Assessment[] = Array.from({ length: 40 }, (_, i) => {
  const org = MOCK_ORGANIZATIONS[i % MOCK_ORGANIZATIONS.length];
  const years = [2023, 2024, 2025, 2026];
  const year = years[i % years.length];
  const statuses: Assessment["status"][] = ["Draft", "In Progress", "Completed", "Submitted"];
  const status = statuses[i % statuses.length];
  const completion = status === "Completed" || status === "Submitted" ? 100 : status === "Draft" ? 5 + (i * 7) % 25 : 30 + (i * 11) % 60;
  const overall = 2.1 + ((i * 0.13) % 2.7);
  
  // Map org industry to template ID
  let templateId = "general";
  if (org.industry === "Real Estate") templateId = "realestate";
  else if (org.industry === "Healthcare") templateId = "healthcare";
  else if (org.industry === "Government") templateId = "government";
  else if (org.industry === "Education") templateId = "education";

  const template = INDUSTRY_TEMPLATES.find((t) => t.id === templateId) || INDUSTRY_TEMPLATES[4];
  const activeFunctions = template.functions.slice(0, 5 + (i % 4)).map((f) => f.id);

  return {
    id: `ASM-${1000 + i}`,
    name: `${year} Capability Assessment`,
    company: org.name,
    status,
    createdAt: `${year - 1}-11-${String((i % 25) + 1).padStart(2, "0")}`,
    updatedAt: `${year}-${String((i % 11) + 1).padStart(2, "0")}-${String((i % 25) + 1).padStart(2, "0")}`,
    overallScore: Math.round(overall * 10) / 10,
    completion,
    year,
    industry: templateId,
    departments: activeFunctions,
    sponsor: "Executive Board",
    contactPerson: org.contactPerson,
    email: org.email,
    phone: org.phone,
  };
});

// Priority recommendations across functions
const REC_TEMPLATES = [
  { func: "strategy", title: "Formulate Cascading Strategic Goals (OKRs)", desc: "Enforce a formal strategic roadmap linked to quarterly OKRs across business units with clear tracking." },
  { func: "hr", title: "Deploy Talent Succession Planning", desc: "Build succession maps and capability tracks for critical leadership roles to mitigate turnover risk." },
  { func: "innovation", title: "Accelerate Digital Transformation Rollout", desc: "Adopt modern cloud, automation, and enterprise system upgrades to replace manual paper sheets." },
  { func: "it", title: "Uplift Cybersecurity Standards", desc: "Implement multi-factor authentication, firewalls, and ISO 27001 audit standards." },
  { func: "legal", title: "Adopt Contract Lifecycle Automation", desc: "Deploy digital signature and clause library databases to reduce contract approvals latency." },
  { func: "risk", title: "Design Enterprise Risk Registers", desc: "Formulate an ERM framework mapping financial, market, regulatory, and operational vulnerabilities." },
  { func: "operations", title: "Automate Process Quality Control", desc: "Incorporate SLA monitoring software and automated analytics to trace operations efficiency." },
  { func: "pm", title: "Standardize Enterprise PMO", desc: "Adopt milestone gate policies, standardized dashboards, and loaded resource management." },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = Array.from({ length: 40 }, (_, i) => {
  const t = REC_TEMPLATES[i % REC_TEMPLATES.length];
  const priorities: Recommendation["priority"][] = ["Critical", "High", "Medium", "Low"];
  const impacts: Recommendation["impact"][] = ["High", "Medium", "Low"];
  const timelines = ["0-3 months", "3-6 months", "6-12 months", "12-18 months"];

  return {
    id: `REC-${100 + i}`,
    title: t.title,
    description: t.desc,
    priority: priorities[i % 4],
    impact: impacts[i % 3],
    timeline: timelines[i % 4],
    department: FUNCTION_DEFS.find((f) => f.id === t.func)?.name || "Strategy",
  };
});

export const MOCK_ROADMAP: RoadmapItem[] = Array.from({ length: 25 }, (_, i) => {
  const t = REC_TEMPLATES[i % REC_TEMPLATES.length];
  const priorities: Recommendation["priority"][] = ["Critical", "High", "Medium", "Low"];
  const timelines = ["0-3 months", "3-6 months", "6-12 months", "12-18 months"];
  const statusList: RoadmapItem["status"][] = ["Not Started", "In Progress", "On Hold", "Completed"];
  const status = statusList[i % 4];
  const owners = ["Sarah Malik", "Ahmed Al Nuaimi", "Karim Haddad", "Layla Farouk", "Omar Zaidan", "Noor Khoury"];

  return {
    id: `INI-${200 + i}`,
    initiative: t.title,
    priority: priorities[i % 4],
    owner: owners[i % owners.length],
    timeline: timelines[i % 4],
    quarter: (["Q1", "Q2", "Q3", "Q4"] as const)[i % 4],
    status,
    progress: status === "Completed" ? 100 : status === "Not Started" ? 0 : 20 + (i * 17) % 65,
    department: FUNCTION_DEFS.find((f) => f.id === t.func)?.name || "Strategy",
  };
});

export const CURRENT_ORG: Organization = MOCK_ORGANIZATIONS[0];

export const DEPARTMENTS_WITH_SCORES = buildDepartments();
