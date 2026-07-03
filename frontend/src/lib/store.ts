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
  INDUSTRY_TEMPLATES,
  FUNCTION_DEFS,
  MOCK_ORGANIZATIONS,
  MOCK_ASSESSMENTS,
  MOCK_RECOMMENDATIONS,
  MOCK_ROADMAP,
} from "./mock-data";

// Detailed interface for Answers
export interface Answer {
  score: number;
  comment: string;
  evidence: string[]; // Mock file names
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: "Admin" | "Organization User";
  organizationId: string | null;
}

export interface OnboardingState {
  step: number;
  accountInfo: {
    fullName: string;
    email: string;
    password?: string;
  } | null;
  orgInfo: {
    name: string;
    industry: string;
    country: string;
    employees: string;
    revenue: string;
    type: string;
    contactPerson: string;
    phone: string;
  } | null;
  selectedFunctions: string[];
  answers: Record<string, Answer>; // questionId -> Answer (temporary answers answered during onboarding)
  evidence: string[]; // Mock file names uploaded during onboarding
}

export interface AppState {
  organizations: Organization[];
  assessments: Assessment[];
  answers: Record<string, Record<string, Answer>>; // assessmentId -> questionId -> Answer
  questions: Question[]; // Master list of questions
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  currentAssessmentId: string | null;

  // Authentication & Roles
  users: User[];
  currentUser: User | null;
  onboardingState: OnboardingState;

  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  addOrganization: (org: Omit<Organization, "id">) => string;
  
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

  // Onboarding Actions
  setOnboardingState: (updates: Partial<OnboardingState>) => void;
  resetOnboardingState: () => void;
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  registerOnboardingUser: () => boolean;
}

// Generate the 1000 master questions (5 templates * 8 functions * 5 sections * 5 questions)
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
      text: "Are roles, responsibilities, and execution ownership clearly assigned for {section} operations?",
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

  INDUSTRY_TEMPLATES.forEach((temp) => {
    temp.functions.forEach((f) => {
      f.sections.forEach((sectName, sIdx) => {
        for (let qIdx = 0; qIdx < 5; qIdx++) {
          const id = `${temp.id}-${f.id}-s${sIdx}-q${qIdx}`;
          const type = questionTypes[qIdx];
          const template = questionTemplates[qIdx];
          const text = template.text.replace("{section}", sectName);
          
          questions.push({
            id,
            text,
            description: template.desc.replace("{section}", sectName),
            type,
            score: 0,
            choices: choicesMap[type] || undefined,
          });
        }
      });
    });
  });

  return questions;
}

// Generate seeded answers for 40 preloaded assessments
export function generateSeededAnswers(questions: Question[], assessments: Assessment[]): Record<string, Record<string, Answer>> {
  const answers: Record<string, Record<string, Answer>> = {};
  
  assessments.forEach((asm) => {
    const asmAnswers: Record<string, Answer> = {};
    const seed = parseInt(asm.id.replace("ASM-", "")) || 1000;
    
    questions.forEach((q) => {
      const templId = q.id.split("-")[0];
      const depId = q.id.split("-")[1];
      
      if (templId === asm.industry && asm.departments.includes(depId)) {
        let score = 0;
        let comment = "";
        let evidence: string[] = [];
        
        if (asm.status === "Completed" || asm.status === "Submitted") {
          const rand = Math.sin(seed + q.id.length) * 10000;
          score = Math.max(1, Math.min(5, Math.round(2 + (rand - Math.floor(rand)) * 3)));
          if ((rand - Math.floor(rand)) > 0.75) {
            evidence.push(`Doc_${depId}_Verification.pdf`);
          }
          if ((rand - Math.floor(rand)) > 0.85) {
            comment = "Capability standards formally verified.";
          }
        } else if (asm.status === "In Progress") {
          const rand = Math.sin(seed * 2 + q.id.length) * 10000;
          const isAnswered = (rand - Math.floor(rand)) > 0.35;
          if (isAnswered) {
            score = Math.max(1, Math.min(5, Math.round(1 + (rand - Math.floor(rand)) * 4)));
            if ((rand - Math.floor(rand)) > 0.85) {
              evidence.push(`Draft_${depId}_Workflow.docx`);
            }
          }
        }
        
        asmAnswers[q.id] = {
          score,
          comment,
          evidence,
        };
      }
    });
    
    answers[asm.id] = asmAnswers;
  });

  return answers;
}

const initialQuestions = generateMasterQuestions();
const initialAnswers = generateSeededAnswers(initialQuestions, MOCK_ASSESSMENTS);

// Generate seed users
function generateSeedUsers(): User[] {
  const users: User[] = [
    {
      id: "u-admin",
      fullName: "System Administrator",
      email: "admin@maturityiq.com",
      password: "admin123",
      role: "Admin",
      organizationId: null,
    },
  ];

  MOCK_ORGANIZATIONS.forEach((org, idx) => {
    let email = org.email || `contact@${org.id}.com`;
    if (org.name === "Emaar Properties") {
      email = "sarah.malik@maturityiq.com";
    }
    users.push({
      id: `u-${org.id}`,
      fullName: org.contactPerson || "Contact Person",
      email,
      password: "password123",
      role: "Organization User",
      organizationId: org.id,
    });
  });

  return users;
}

const initialOnboardingState: OnboardingState = {
  step: 0,
  accountInfo: null,
  orgInfo: null,
  selectedFunctions: [],
  answers: {},
  evidence: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      organizations: MOCK_ORGANIZATIONS,
      assessments: MOCK_ASSESSMENTS,
      answers: initialAnswers,
      questions: initialQuestions,
      recommendations: MOCK_RECOMMENDATIONS,
      roadmap: MOCK_ROADMAP,
      currentAssessmentId: null,

      // Authentication & Roles
      users: generateSeedUsers(),
      currentUser: null,
      onboardingState: initialOnboardingState,

      setOrganizations: (orgs) => set({ organizations: orgs }),
      
      updateOrganization: (id, updates) => set((state) => ({
        organizations: state.organizations.map((org) => org.id === id ? { ...org, ...updates } : org)
      })),

      addOrganization: (orgData) => {
        const id = `org-${get().organizations.length + 1}`;
        const newOrg: Organization = {
          ...orgData,
          id,
        };
        set((state) => ({
          organizations: [...state.organizations, newOrg]
        }));
        return id;
      },

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

        // Create empty answer structures for chosen template + functions
        const asmAnswers: Record<string, Answer> = {};
        get().questions.forEach((q) => {
          const templId = q.id.split("-")[0];
          const depId = q.id.split("-")[1];
          if (templId === assessmentData.industry && assessmentData.departments.includes(depId)) {
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

        // Trigger score updates
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
          const templId = q.id.split("-")[0];
          const depId = q.id.split("-")[1];
          if (templId === asm.industry && asm.departments.includes(depId)) {
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
          status = "Submitted"; // auto submit on 100% completion for onboarding flow
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

        // Check each function's average score from the active template
        const template = INDUSTRY_TEMPLATES.find((t) => t.id === asm.industry) || INDUSTRY_TEMPLATES[0];
        template.functions.forEach((f) => {
          if (asm.departments.includes(f.id)) {
            let depSum = 0;
            let depCount = 0;
            get().questions.forEach((q) => {
              if (q.id.startsWith(`${asm.industry}-${f.id}-`)) {
                const ans = asmAnswers[q.id];
                if (ans && ans.score > 0) {
                  depSum += ans.score;
                  depCount++;
                }
              }
            });
            const depAvg = depCount ? depSum / depCount : 0;
            if (depAvg > 0 && depAvg < 3.2) {
              lowScoreDeps.push(f.name);
            }
          }
        });

        // Filter recommendations linked to low score departments
        const relevantRecs = MOCK_RECOMMENDATIONS.filter((r) => lowScoreDeps.includes(r.department));

        set((state) => ({
          recommendations: [...relevantRecs.slice(0, 15), ...state.recommendations.filter(r => !lowScoreDeps.includes(r.department))].slice(0, 100)
        }));
      },

      resetAllData: () => {
        localStorage.removeItem("maturity-assessment-storage");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        set({
          organizations: MOCK_ORGANIZATIONS,
          assessments: MOCK_ASSESSMENTS,
          answers: initialAnswers,
          questions: initialQuestions,
          recommendations: MOCK_RECOMMENDATIONS,
          roadmap: MOCK_ROADMAP,
          currentAssessmentId: null,
          currentUser: null,
          users: generateSeedUsers(),
          onboardingState: initialOnboardingState,
        });
      },

      setOnboardingState: (updates) => set((state) => ({
        onboardingState: { ...state.onboardingState, ...updates }
      })),

      resetOnboardingState: () => set({ onboardingState: initialOnboardingState }),

      loginUser: (email, password) => {
        const normalizedEmail = email.toLowerCase().trim();
        const lookupEmail = normalizedEmail === "sarah.malik@maturityiq.com" ? "sarah.malik@emaarproperties.com" : normalizedEmail;
        
        let user = get().users.find((u) => u.email.toLowerCase() === lookupEmail && u.password === password);
        if (!user && normalizedEmail === "sarah.malik@maturityiq.com") {
          user = get().users.find((u) => u.email.toLowerCase() === normalizedEmail && u.password === password);
        }

        if (user) {
          set({ currentUser: user });
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", user.role);
          return true;
        }
        return false;
      },

      logoutUser: () => {
        set({ currentUser: null });
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
      },

      registerOnboardingUser: () => {
        const { accountInfo, orgInfo, selectedFunctions, answers } = get().onboardingState;
        if (!accountInfo || !orgInfo) return false;

        // 1. Create Organization
        const orgId = `org-${get().organizations.length + 1}`;
        const newOrg: Organization = {
          id: orgId,
          name: orgInfo.name,
          industry: orgInfo.industry,
          country: orgInfo.country,
          employees: parseInt(orgInfo.employees) || 100,
          revenue: orgInfo.revenue,
          type: orgInfo.type,
          contactPerson: orgInfo.contactPerson,
          email: accountInfo.email,
          phone: orgInfo.phone,
          assessmentYear: 2026,
        };

        // 2. Create User
        const userId = `u-${orgId}`;
        const newUser: User = {
          id: userId,
          fullName: accountInfo.fullName,
          email: accountInfo.email,
          password: accountInfo.password || "password123",
          role: "Organization User",
          organizationId: orgId,
        };

        // 3. Create Assessment
        const asmId = `ASM-${1000 + get().assessments.length}`;
        let industryTemplateId = "general";
        if (orgInfo.industry === "Real Estate") industryTemplateId = "realestate";
        else if (orgInfo.industry === "Healthcare") industryTemplateId = "healthcare";
        else if (orgInfo.industry === "Government") industryTemplateId = "government";
        else if (orgInfo.industry === "Education") industryTemplateId = "education";

        const newAsm: Assessment = {
          id: asmId,
          name: "2026 Capability Assessment",
          company: orgInfo.name,
          status: "Submitted", // complete the assessment during registration
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          overallScore: 0,
          completion: 100,
          year: 2026,
          industry: industryTemplateId,
          departments: selectedFunctions,
          sponsor: orgInfo.contactPerson,
          contactPerson: orgInfo.contactPerson,
          email: accountInfo.email,
          phone: orgInfo.phone,
        };

        // Convert onboarding answers
        const asmAnswers: Record<string, Answer> = {};
        // Master list questions matching the industry and functions
        get().questions.forEach((q) => {
          const templId = q.id.split("-")[0];
          const depId = q.id.split("-")[1];
          if (templId === industryTemplateId && selectedFunctions.includes(depId)) {
            asmAnswers[q.id] = answers[q.id] || { score: 3, comment: "Initial onboarding evaluation.", evidence: [] };
          }
        });

        // 4. Update Store State
        set((state) => ({
          organizations: [...state.organizations, newOrg],
          users: [...state.users, newUser],
          assessments: [newAsm, ...state.assessments],
          answers: { ...state.answers, [asmId]: asmAnswers },
          currentUser: newUser,
          currentAssessmentId: asmId,
        }));

        // Trigger score updates & recommendations
        get().calculateAndSetScores(asmId);
        get().regenerateRecommendations(asmId);

        // Login user
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "Organization User");

        // Clear onboarding state
        get().resetOnboardingState();
        return true;
      },
    }),
    {
      name: "maturity-assessment-storage",
    }
  )
);
