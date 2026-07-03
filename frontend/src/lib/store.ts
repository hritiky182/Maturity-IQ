import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MaturityLevel,
  Question,
  Section,
  Department,
  Assessment,
  Recommendation,
  RoadmapItem,
  Organization,
  DEPARTMENT_DEFS,
} from "./mock-data";

// Detailed interface for Answers
export interface Answer {
  score: number;
  comment: string;
  evidence: string[]; // Mock file names
}

export interface AppState {
  organizations: Organization[];
  assessments: Assessment[];
  answers: Record<string, Record<string, Answer>>; // assessmentId -> questionId -> Answer
  questions: Question[]; // Master list of questions
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  currentAssessmentId: string | null;

  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  
  createAssessment: (assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt" | "overallScore" | "completion">) => string;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  duplicateAssessment: (id: string) => void;
  
  saveAnswer: (assessmentId: string, questionId: string, answer: Answer) => void;
  saveMultipleAnswers: (assessmentId: string, answers: Record<string, Answer>) => void;
  calculateAndSetScores: (assessmentId: string) => void;
  
  addRoadmapItem: (item: Omit<RoadmapItem, "id">) => void;
  updateRoadmapItem: (id: string, updates: Partial<RoadmapItem>) => void;
  deleteRoadmapItem: (id: string) => void;
  
  setCurrentAssessmentId: (id: string | null) => void;
  regenerateRecommendations: (assessmentId: string) => void;
  resetAllData: () => void;
}

// Deterministic random generator based on a seed
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate the 300 questions (12 departments * 5 sections * 5 questions)
export function generateMasterQuestions(): Question[] {
  const questions: Question[] = [];
  const questionTypes: Question["type"][] = ["rating", "yesno", "single", "multi", "text"];
  
  const choicesMap: Record<string, string[]> = {
    single: ["Not Documented", "Partially Documented", "Fully Standardized", "Continuously Optimized"],
    multi: ["Standard Template Created", "Team Formally Trained", "Audit Controls in Place", "Dashboard Enabled"],
  };

  const questionTemplates = [
    {
      text: "Is there a formal framework defined and documented for {section}?",
      desc: "Assess if a structured methodology, policy, or framework has been officially approved and published.",
    },
    {
      text: "Are roles, responsibilities, and ownership clearly assigned for {section} operations?",
      desc: "Determine if staff are aware of their responsibilities and if key performance indicators are aligned.",
    },
    {
      text: "How mature is measurement, reporting, and dashboarding in {section}?",
      desc: "Check if data is gathered, validated, and reported to executive leadership periodically.",
    },
    {
      text: "Are continuous improvement and feedback loops established for {section}?",
      desc: "Verify if operations are audited, adjusted, and optimized based on performance metrics.",
    },
    {
      text: "How well is {section} integrated with the broader organizational strategy and technology?",
      desc: "Evaluate if there is seamless cross-departmental integration and digital tool usage.",
    },
  ];

  DEPARTMENT_DEFS.forEach((d) => {
    d.sections.forEach((sectName, sIdx) => {
      for (let qIdx = 0; qIdx < 5; qIdx++) {
        const id = `${d.id}-s${sIdx}-q${qIdx}`;
        const type = questionTypes[qIdx];
        const template = questionTemplates[qIdx];
        const text = template.text.replace("{section}", sectName);
        
        questions.push({
          id,
          text,
          description: template.desc.replace("{section}", sectName),
          type,
          score: 0, // Master templates have 0 score, actual scores are in answers
          choices: choicesMap[type] || undefined,
        });
      }
    });
  });

  return questions;
}

// Generate 50 Organizations
const COMPANIES = [
  "Emaar Holdings", "Dar Al Arkan", "DAMAC Properties", "Nakheel Group", "Aldar Properties",
  "Meraas", "Sobha Realty", "Deyaar Development", "Union Properties", "Azizi Developments",
  "Ellington Properties", "Binghatti Developers", "Danube Properties", "Select Group", "Omniyat",
  "MAG Property", "Reportage Properties", "Bloom Holding", "Modon Properties", "Imkan",
  "Diyar Al Bahrain", "Kingdom Holding", "Roshn", "NHC Real Estate", "Retal Urban",
  "Jabal Omar", "Red Sea Global", "Diriyah Company", "Qiddiya", "Wasl Asset Management",
  "Dubai Holding", "Nakheel Properties", "Arada", "Al Futtaim Group", "Majid Al Futtaim",
  "Sharjah Asset Management", "Diyar Al Muharraq", "Manazel Real Estate", "Eshraq Investments",
  "RAK Properties", "Al Qudra Holding", "Amlak Finance", "Union Properties PJSC", "Deyaar PJSC",
  "Aldar Investment", "Emaar Development", "Emaar Malls", "Damac Hills Corp", "Sobha Group", "Meraas Holding"
];

export function generateOrganizations(): Organization[] {
  return Array.from({ length: 50 }, (_, i) => {
    const name = COMPANIES[i] || `GCC Developer ${i + 1}`;
    const country = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"][i % 6];
    const employees = 150 + Math.floor(seededRandom(i + 1) * 8000);
    const revVal = 30 + Math.floor(seededRandom(i + 2) * 2500);
    const revenue = revVal >= 1000 ? `$${(revVal / 1000).toFixed(1)}B` : `$${revVal}M`;
    const type = ["Public", "Private", "Family Office", "Joint Venture"][i % 4];
    return {
      id: `org-${i + 1}`,
      name,
      industry: "Real Estate Development",
      country,
      employees,
      revenue,
      type,
    };
  });
}

// Seed 200 Assessments
export function generateAssessments(orgs: Organization[]): {
  assessments: Assessment[];
  answers: Record<string, Record<string, Answer>>;
} {
  const assessments: Assessment[] = [];
  const answers: Record<string, Record<string, Answer>> = {};
  const years = [2023, 2024, 2025, 2026];
  const statuses: Assessment["status"][] = ["Draft", "In Progress", "Completed", "Submitted"];
  
  // Master question list to calculate IDs
  const masterQuestions = generateMasterQuestions();

  for (let i = 0; i < 200; i++) {
    const org = orgs[i % orgs.length];
    const year = years[i % years.length];
    const status = statuses[i % statuses.length];
    const id = `ASM-${1000 + i}`;
    
    // Choose departments for this assessment
    // For 200 assessments, we include all departments by default or a subset
    const numDeps = 6 + (i % 7); // between 6 and 12
    const selectedDeps = DEPARTMENT_DEFS.slice(0, numDeps).map((d) => d.id);
    
    // Create answers for this assessment
    const asmAnswers: Record<string, Answer> = {};
    let totalScoreSum = 0;
    let answeredCount = 0;
    let totalQuestionsCount = 0;

    masterQuestions.forEach((q) => {
      // Find which department this question belongs to
      const depId = q.id.split("-")[0];
      if (selectedDeps.includes(depId)) {
        totalQuestionsCount++;
        
        // Seed score based on deterministic random formula
        let score = 0;
        const comment = i % 10 === 0 ? "Initial process evaluation completed." : "";
        const evidence: string[] = [];
        
        if (status === "Completed" || status === "Submitted") {
          score = Math.max(1, Math.min(5, Math.round(2 + seededRandom(i * 10 + q.id.length) * 3)));
          answeredCount++;
          totalScoreSum += score;
          
          if (seededRandom(i + score) > 0.7) {
            evidence.push(`Evidence_${depId}_${year}.pdf`);
          }
        } else if (status === "In Progress") {
          // partially answered
          const isAnswered = seededRandom(i * 5 + q.id.length) > 0.4;
          if (isAnswered) {
            score = Math.max(1, Math.min(5, Math.round(2 + seededRandom(i * 15 + q.id.length) * 3)));
            answeredCount++;
            totalScoreSum += score;
            if (seededRandom(i + score) > 0.8) {
              evidence.push(`Evidence_${depId}_Draft.docx`);
            }
          }
        } else {
          // Draft: very few answered
          const isAnswered = seededRandom(i * 3 + q.id.length) > 0.8;
          if (isAnswered) {
            score = Math.max(1, Math.min(5, Math.round(1 + seededRandom(i * 5 + q.id.length) * 4)));
            answeredCount++;
            totalScoreSum += score;
          }
        }

        asmAnswers[q.id] = {
          score,
          comment,
          evidence,
        };
      }
    });

    const completion = totalQuestionsCount ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;
    const overallScore = answeredCount ? Number((totalScoreSum / answeredCount).toFixed(2)) : 0;
    
    // Format dates
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String((i % 25) + 1).padStart(2, "0");
    
    assessments.push({
      id,
      name: `${year} Annual Maturity Review`,
      company: org.name,
      status,
      createdAt: `${year - 1}-12-${day}`,
      updatedAt: `${year}-${month}-${day}`,
      overallScore,
      completion,
      year,
      departments: selectedDeps,
    });

    answers[id] = asmAnswers;
  }

  return { assessments, answers };
}

// Generate 100 Recommendations
export function generateRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const priorities: Recommendation["priority"][] = ["Critical", "High", "Medium", "Low"];
  const impacts: Recommendation["impact"][] = ["High", "Medium", "Low"];
  const timelines = ["0-3 months", "3-6 months", "6-12 months", "12-18 months"];

  const templates = [
    { title: "Define formal KPI metrics and reporting dashboards", desc: "Introduce a central dashboard to track operational milestones and performance monthly." },
    { title: "Standardize contractor SLAs and penalty frameworks", desc: "Draft a standardized vendor contracting policy with clear milestone penalties and review procedures." },
    { title: "Incorporate BIM and digital twin protocols in project initiation", desc: "Upgrade structural design standards to enforce building information modeling across all JV developments." },
    { title: "Conduct enterprise cybersecurity penetration testing", desc: "Schedule an external audit of consumer-facing billing portals and internal database configurations." },
    { title: "Establish an executive risk committee and ERM register", desc: "Initiate quarterly risk reporting covering currency hedging, material inflation, and regulatory changes." },
    { title: "Implement contract lifecycle management software", desc: "Reduce review bottlenecks in joint-venture contracts through automated legal routing and approval systems." },
    { title: "Deploy mobile CRM for broker network enablement", desc: "Improve lead response time and listing visibility through a specialized field agent application." },
    { title: "Formulate NPS customer feedback loops for post-handover", desc: "Collect customer satisfaction data at key milestones: sales agreement, key handover, and defect liability." },
    { title: "Establish category management and bulk purchasing hubs", desc: "Consolidate procurement of steel, cement, and MEP finishes to extract volume discounts." },
    { title: "Launch leadership training and succession plans", desc: "Create a fast-track program for high-potential project managers to secure key engineering roles." },
  ];

  for (let i = 0; i < 100; i++) {
    const templ = templates[i % templates.length];
    const depDef = DEPARTMENT_DEFS[i % DEPARTMENT_DEFS.length];
    const priority = priorities[i % 4];
    const impact = impacts[i % 3];
    const timeline = timelines[i % 4];

    recommendations.push({
      id: `REC-${100 + i}`,
      title: `${depDef.name}: ${templ.title}`,
      description: templ.desc,
      priority,
      impact,
      timeline,
      department: depDef.name,
    });
  }

  return recommendations;
}

// Generate 50 Roadmap Items
export function generateRoadmapItems(recs: Recommendation[]): RoadmapItem[] {
  const roadmap: RoadmapItem[] = [];
  const owners = ["Sarah Malik", "Ahmed Al Nuaimi", "Karim Haddad", "Layla Farouk", "Omar Zaidan", "Noor Khoury", "Zayd Al Maktoum", "Fatima Al Ghaith"];
  const quarters: RoadmapItem["quarter"][] = ["Q1", "Q2", "Q3", "Q4"];
  const statuses: RoadmapItem["status"][] = ["Not Started", "In Progress", "On Hold", "Completed"];

  for (let i = 0; i < 50; i++) {
    const rec = recs[i % recs.length];
    const status = statuses[i % 4];
    const progress = status === "Completed" ? 100 : status === "Not Started" ? 0 : 15 + (i * 13) % 70;

    roadmap.push({
      id: `INI-${200 + i}`,
      initiative: rec.title,
      priority: rec.priority,
      owner: owners[i % owners.length],
      timeline: rec.timeline,
      quarter: quarters[i % 4],
      status,
      progress,
      department: rec.department,
    });
  }

  return roadmap;
}

// Initialize seed data
const seededOrgs = generateOrganizations();
const seededQuestions = generateMasterQuestions();
const { assessments: seededAsms, answers: seededAnswers } = generateAssessments(seededOrgs);
const seededRecs = generateRecommendations();
const seededRoadmap = generateRoadmapItems(seededRecs);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      organizations: seededOrgs,
      assessments: seededAsms,
      answers: seededAnswers,
      questions: seededQuestions,
      recommendations: seededRecs,
      roadmap: seededRoadmap,
      currentAssessmentId: null,

      setOrganizations: (orgs) => set({ organizations: orgs }),
      
      updateOrganization: (id, updates) => set((state) => ({
        organizations: state.organizations.map((org) => org.id === id ? { ...org, ...updates } : org)
      })),

      createAssessment: (assessmentData) => {
        const id = `ASM-${1000 + get().assessments.length}`;
        const newAsm: Assessment = {
          ...assessmentData,
          id,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          overallScore: 0,
          completion: 0,
        };

        // Create empty answer structures for each question in chosen departments
        const asmAnswers: Record<string, Answer> = {};
        get().questions.forEach((q) => {
          const depId = q.id.split("-")[0];
          if (assessmentData.departments.includes(depId)) {
            asmAnswers[q.id] = { score: 0, comment: "", evidence: [] };
          }
        });

        set((state) => ({
          assessments: [newAsm, ...state.assessments],
          answers: { ...state.answers, [id]: asmAnswers },
          currentAssessmentId: id,
        }));

        return id;
      },

      updateAssessment: (id, updates) => set((state) => ({
        assessments: state.assessments.map((asm) => asm.id === id ? { ...asm, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : asm)
      })),

      deleteAssessment: (id) => set((state) => {
        const remainingAnswers = { ...state.answers };
        delete remainingAnswers[id];
        return {
          assessments: state.assessments.filter((asm) => asm.id !== id),
          answers: remainingAnswers,
          currentAssessmentId: state.currentAssessmentId === id ? null : state.currentAssessmentId,
        };
      }),

      duplicateAssessment: (id) => {
        const sourceAsm = get().assessments.find((a) => a.id === id);
        if (!sourceAsm) return;

        const newId = `ASM-${1000 + get().assessments.length}`;
        const duplicatedAsm: Assessment = {
          ...sourceAsm,
          id: newId,
          name: `Copy of ${sourceAsm.name}`,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          status: "Draft",
        };

        const duplicatedAnswers = get().answers[id] ? JSON.parse(JSON.stringify(get().answers[id])) : {};

        set((state) => ({
          assessments: [duplicatedAsm, ...state.assessments],
          answers: { ...state.answers, [newId]: duplicatedAnswers },
        }));
      },

      saveAnswer: (assessmentId, questionId, answer) => set((state) => {
        const asmAnswers = state.answers[assessmentId] || {};
        const updatedAnswers = {
          ...state.answers,
          [assessmentId]: {
            ...asmAnswers,
            [questionId]: answer,
          },
        };

        // Trigger score update after modifying answer
        setTimeout(() => get().calculateAndSetScores(assessmentId), 0);

        return { answers: updatedAnswers };
      }),

      saveMultipleAnswers: (assessmentId, multipleAnswers) => set((state) => {
        const asmAnswers = state.answers[assessmentId] || {};
        const updatedAnswers = {
          ...state.answers,
          [assessmentId]: {
            ...asmAnswers,
            ...multipleAnswers,
          },
        };

        // Trigger score update
        setTimeout(() => get().calculateAndSetScores(assessmentId), 0);

        return { answers: updatedAnswers };
      }),

      calculateAndSetScores: (assessmentId) => {
        const asm = get().assessments.find((a) => a.id === assessmentId);
        if (!asm) return;

        const asmAnswers = get().answers[assessmentId] || {};
        let totalScoreSum = 0;
        let answeredCount = 0;
        let totalQuestionsCount = 0;

        get().questions.forEach((q) => {
          const depId = q.id.split("-")[0];
          if (asm.departments.includes(depId)) {
            totalQuestionsCount++;
            const ans = asmAnswers[q.id];
            if (ans && ans.score > 0) {
              answeredCount++;
              totalScoreSum += ans.score;
            }
          }
        });

        const completion = totalQuestionsCount ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;
        const overallScore = answeredCount ? Number((totalScoreSum / answeredCount).toFixed(2)) : 0;
        
        let status = asm.status;
        if (completion === 100 && status !== "Completed" && status !== "Submitted") {
          status = "In Progress";
        } else if (completion > 0 && status === "Draft") {
          status = "In Progress";
        }

        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? { ...a, completion, overallScore, status, updatedAt: new Date().toISOString().split("T")[0] }
              : a
          ),
        }));
      },

      addRoadmapItem: (item) => set((state) => ({
        roadmap: [
          ...state.roadmap,
          { ...item, id: `INI-${200 + state.roadmap.length}` },
        ],
      })),

      updateRoadmapItem: (id, updates) => set((state) => ({
        roadmap: state.roadmap.map((item) => item.id === id ? { ...item, ...updates } : item)
      })),

      deleteRoadmapItem: (id) => set((state) => ({
        roadmap: state.roadmap.filter((item) => item.id !== id)
      })),

      setCurrentAssessmentId: (id) => set({ currentAssessmentId: id }),

      regenerateRecommendations: (assessmentId) => {
        const asm = get().assessments.find((a) => a.id === assessmentId);
        if (!asm) return;

        const asmAnswers = get().answers[assessmentId] || {};
        const lowScoreDeps: string[] = [];

        // Check each department's average score
        DEPARTMENT_DEFS.forEach((d) => {
          if (asm.departments.includes(d.id)) {
            let depSum = 0;
            let depCount = 0;
            get().questions.forEach((q) => {
              if (q.id.startsWith(d.id)) {
                const ans = asmAnswers[q.id];
                if (ans && ans.score > 0) {
                  depSum += ans.score;
                  depCount++;
                }
              }
            });
            const depAvg = depCount ? depSum / depCount : 0;
            if (depAvg > 0 && depAvg < 3.2) {
              lowScoreDeps.push(d.name);
            }
          }
        });

        // Filter and regenerate recommendations linked to these low score departments
        const allRecs = generateRecommendations();
        const relevantRecs = allRecs.filter((r) => lowScoreDeps.includes(r.department));

        set((state) => ({
          // Overwrite first 20 recommendations with the fresh ones for this assessment
          recommendations: [...relevantRecs.slice(0, 15), ...state.recommendations.filter(r => !lowScoreDeps.includes(r.department))].slice(0, 100)
        }));
      },

      resetAllData: () => {
        localStorage.removeItem("maturity-assessment-storage");
        set({
          organizations: seededOrgs,
          assessments: seededAsms,
          answers: seededAnswers,
          questions: seededQuestions,
          recommendations: seededRecs,
          roadmap: seededRoadmap,
          currentAssessmentId: null,
        });
      },
    }),
    {
      name: "maturity-assessment-storage",
    }
  )
);
