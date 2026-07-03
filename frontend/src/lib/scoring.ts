import type { Department, MaturityLevel, Section } from "./mock-data";
import { DEPARTMENT_DEFS } from "./mock-data";
import { useStore } from "./store";

export function getAssessmentDepartments(assessmentId: string): Department[] {
  const state = useStore.getState();
  const assessment = state.assessments.find((a) => a.id === assessmentId);
  if (!assessment) return [];

  const asmAnswers = state.answers[assessmentId] || {};

  return DEPARTMENT_DEFS.filter((d) => assessment.departments.includes(d.id)).map((d) => {
    return {
      id: d.id,
      name: d.name,
      icon: d.icon,
      sections: d.sections.map((sname, si) => {
        const sectionId = `${d.id}-s${si}`;
        const sectionQuestions = state.questions
          .filter((q) => q.id.startsWith(`${d.id}-s${si}-`))
          .map((q) => {
            const ans = asmAnswers[q.id] || { score: 0, comment: "", evidence: [] };
            return {
              ...q,
              score: ans.score,
            };
          });
        return {
          id: sectionId,
          name: sname,
          questions: sectionQuestions,
        };
      }),
    };
  });
}

export function maturityLevel(score: number): MaturityLevel {
  if (score < 1.5) return "Initial";
  if (score < 2.5) return "Developing";
  if (score < 3.5) return "Defined";
  if (score < 4.5) return "Managed";
  return "Optimized";
}

export function maturityColor(score: number): string {
  const lvl = maturityLevel(score);
  return {
    Initial: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
    Developing: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900",
    Defined: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
    Managed: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
    Optimized: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-900",
  }[lvl] || "";
}

export function priorityColor(p: string): string {
  return {
    Critical: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300",
    High: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-300",
    Medium: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
    Low: "text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
  }[p] || "";
}

export function sectionScore(s: Section): number {
  const answered = s.questions.filter((q) => q.score > 0);
  if (!answered.length) return 0;
  return answered.reduce((a, q) => a + q.score, 0) / answered.length;
}

export function departmentScore(d: Department): number {
  const scores = d.sections.map(sectionScore).filter((s) => s > 0);
  if (!scores.length) return 0;
  return scores.reduce((a, s) => a + s, 0) / scores.length;
}

export function overallScore(deps: Department[]): number {
  const scores = deps.map(departmentScore).filter((s) => s > 0);
  if (!scores.length) return 0;
  return scores.reduce((a, s) => a + s, 0) / scores.length;
}

export function departmentCompletion(d: Department): number {
  const total = d.sections.reduce((a, s) => a + s.questions.length, 0);
  const answered = d.sections.reduce(
    (a, s) => a + s.questions.filter((q) => q.score > 0).length,
    0,
  );
  return total ? Math.round((answered / total) * 100) : 0;
}

