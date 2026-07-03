import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useStore, Answer } from "@/lib/store";
import { INDUSTRY_TEMPLATES, FUNCTION_DEFS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  X,
  Building,
  Lock,
  User as UserIcon,
  ShieldCheck,
  HelpCircle,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  "Account",
  "Organization",
  "Functions",
  "Assessment",
  "Documents",
  "Review",
  "Complete"
];

const INDUSTRIES = [
  "Real Estate",
  "Healthcare",
  "Government",
  "Education",
  "Manufacturing",
  "Banking & Finance",
  "Technology",
  "Consulting",
  "Retail",
  "Other Enterprises"
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const onboarding = useStore((state) => state.onboardingState);
  const setOnboardingState = useStore((state) => state.setOnboardingState);
  const registerOnboardingUser = useStore((state) => state.registerOnboardingUser);
  const questions = useStore((state) => state.questions);

  // local wizard state
  const [activeFuncId, setActiveFuncId] = useState<string>("");
  const [activeSecIdx, setActiveSecIdx] = useState<number>(0);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Step 1: Account info local state for easy handling
  const [fullName, setFullName] = useState(onboarding.accountInfo?.fullName || "");
  const [email, setEmail] = useState(onboarding.accountInfo?.email || "");
  const [password, setPassword] = useState(onboarding.accountInfo?.password || "");

  // Step 2: Org Info local state
  const [orgName, setOrgName] = useState(onboarding.orgInfo?.name || "");
  const [industry, setIndustry] = useState(onboarding.orgInfo?.industry || "Real Estate");
  const [country, setCountry] = useState(onboarding.orgInfo?.country || "UAE");
  const [employees, setEmployees] = useState(onboarding.orgInfo?.employees || "250");
  const [revenue, setRevenue] = useState(onboarding.orgInfo?.revenue || "$50M");
  const [orgType, setOrgType] = useState(onboarding.orgInfo?.type || "Private");
  const [contactPerson, setContactPerson] = useState(onboarding.orgInfo?.contactPerson || "");
  const [phone, setPhone] = useState(onboarding.orgInfo?.phone || "");

  // Sync from store on load (in case they left and came back)
  useEffect(() => {
    if (onboarding.accountInfo) {
      setFullName(onboarding.accountInfo.fullName);
      setEmail(onboarding.accountInfo.email);
      setPassword(onboarding.accountInfo.password || "");
      setPasswordConfirm(onboarding.accountInfo.password || "");
    }
    if (onboarding.orgInfo) {
      setOrgName(onboarding.orgInfo.name);
      setIndustry(onboarding.orgInfo.industry);
      setCountry(onboarding.orgInfo.country);
      setEmployees(onboarding.orgInfo.employees);
      setRevenue(onboarding.orgInfo.revenue);
      setOrgType(onboarding.orgInfo.type);
      setContactPerson(onboarding.orgInfo.contactPerson);
      setPhone(onboarding.orgInfo.phone);
    }
  }, []);

  // Map industry string to template ID
  const getTemplateIdForIndustry = (ind: string) => {
    if (ind === "Real Estate") return "realestate";
    if (ind === "Healthcare") return "healthcare";
    if (ind === "Government") return "government";
    if (ind === "Education") return "education";
    return "general";
  };

  const activeTemplate = useMemo(() => {
    const tempId = getTemplateIdForIndustry(industry);
    return INDUSTRY_TEMPLATES.find((t) => t.id === tempId) || INDUSTRY_TEMPLATES[0];
  }, [industry]);

  // Set first selected business function as active function tab when Step 3 changes
  useEffect(() => {
    if (onboarding.selectedFunctions.length > 0 && !activeFuncId) {
      setActiveFuncId(onboarding.selectedFunctions[0]);
    }
  }, [onboarding.selectedFunctions, activeFuncId]);

  // Get current active function, category, questions
  const activeFuncDef = useMemo(() => {
    return activeTemplate.functions.find((f) => f.id === activeFuncId) || activeTemplate.functions[0];
  }, [activeTemplate, activeFuncId]);

  const activeSectionId = `${activeFuncDef?.id}-s${activeSecIdx}`;
  const sectionQuestions = useMemo(() => {
    const tempId = getTemplateIdForIndustry(industry);
    return questions.filter((q) => q.id.startsWith(`${tempId}-${activeSectionId}-`));
  }, [questions, activeSectionId, industry]);

  // Calculate statistics for Selected Functions
  const totalQuestions = useMemo(() => {
    const tempId = getTemplateIdForIndustry(industry);
    return questions.filter((q) => {
      const qTempId = q.id.split("-")[0];
      const qFuncId = q.id.split("-")[1];
      return qTempId === tempId && onboarding.selectedFunctions.includes(qFuncId);
    }).length;
  }, [questions, industry, onboarding.selectedFunctions]);

  const answeredCount = useMemo(() => {
    let count = 0;
    const tempId = getTemplateIdForIndustry(industry);
    questions.forEach((q) => {
      const qTempId = q.id.split("-")[0];
      const qFuncId = q.id.split("-")[1];
      if (qTempId === tempId && onboarding.selectedFunctions.includes(qFuncId)) {
        if (onboarding.answers[q.id]?.score > 0) {
          count++;
        }
      }
    });
    return count;
  }, [questions, industry, onboarding.selectedFunctions, onboarding.answers]);

  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const averageScore = useMemo(() => {
    let sum = 0;
    let count = 0;
    const tempId = getTemplateIdForIndustry(industry);
    questions.forEach((q) => {
      const qTempId = q.id.split("-")[0];
      const qFuncId = q.id.split("-")[1];
      if (qTempId === tempId && onboarding.selectedFunctions.includes(qFuncId)) {
        const ans = onboarding.answers[q.id];
        if (ans && ans.score > 0) {
          sum += ans.score;
          count++;
        }
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : "0.00";
  }, [questions, industry, onboarding.selectedFunctions, onboarding.answers]);

  const activeFuncCompletion = useMemo(() => {
    if (!activeFuncDef) return 0;
    const tempId = getTemplateIdForIndustry(industry);
    const fQuestions = questions.filter(q => q.id.startsWith(`${tempId}-${activeFuncId}-`));
    const fAnswered = fQuestions.filter(q => onboarding.answers[q.id]?.score > 0).length;
    return fQuestions.length > 0 ? Math.round((fAnswered / fQuestions.length) * 100) : 0;
  }, [questions, onboarding.answers, activeFuncId, industry, activeFuncDef]);

  const activeFuncScore = useMemo(() => {
    if (!activeFuncDef) return 0;
    const tempId = getTemplateIdForIndustry(industry);
    const fQuestions = questions.filter(q => q.id.startsWith(`${tempId}-${activeFuncId}-`));
    let sum = 0;
    let count = 0;
    fQuestions.forEach((q) => {
      const scoreVal = onboarding.answers[q.id]?.score || 0;
      if (scoreVal > 0) {
        sum += scoreVal;
        count++;
      }
    });
    return count > 0 ? Number((sum / count).toFixed(2)) : 0;
  }, [questions, onboarding.answers, activeFuncId, industry, activeFuncDef]);


  // Step navigation & local updates
  const handleNext = () => {
    if (onboarding.step === 0) {
      // Validate Step 1
      if (!fullName || !email || !password) {
        toast.error("Please fill in all account fields");
        return;
      }
      if (password !== passwordConfirm) {
        toast.error("Passwords do not match");
        return;
      }
      setOnboardingState({
        accountInfo: { fullName, email, password },
        step: 1
      });
    } else if (onboarding.step === 1) {
      // Validate Step 2
      if (!orgName || !contactPerson || !phone) {
        toast.error("Please fill in all organization profile fields");
        return;
      }
      setOnboardingState({
        orgInfo: {
          name: orgName,
          industry,
          country,
          employees,
          revenue,
          type: orgType,
          contactPerson,
          phone
        },
        step: 2
      });

      // Default select all business functions if empty
      if (onboarding.selectedFunctions.length === 0) {
        setOnboardingState({
          selectedFunctions: FUNCTION_DEFS.map((f) => f.id)
        });
      }
    } else if (onboarding.step === 2) {
      // Validate Step 3
      if (onboarding.selectedFunctions.length === 0) {
        toast.error("Please select at least one business function for evaluation");
        return;
      }
      setOnboardingState({ step: 3 });
      if (onboarding.selectedFunctions.length > 0) {
        setActiveFuncId(onboarding.selectedFunctions[0]);
        setActiveSecIdx(0);
      }
    } else if (onboarding.step === 3) {
      // Validate Step 4
      if (completionPercentage < 10) {
        toast.warning("We recommend answering more assessment questions for an accurate baseline roadmap. Proceed anyway?");
      }
      setOnboardingState({ step: 4 });
    } else if (onboarding.step === 4) {
      setOnboardingState({ step: 5 });
    } else if (onboarding.step === 5) {
      // Review & Submit
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (onboarding.step > 0) {
      setOnboardingState({ step: onboarding.step - 1 });
    }
  };

  const handleFuncSelectToggle = (fId: string) => {
    const list = [...onboarding.selectedFunctions];
    if (list.includes(fId)) {
      setOnboardingState({ selectedFunctions: list.filter((id) => id !== fId) });
    } else {
      setOnboardingState({ selectedFunctions: [...list, fId] });
    }
  };

  const handleSelectAll = () => {
    setOnboardingState({ selectedFunctions: FUNCTION_DEFS.map((f) => f.id) });
  };

  const handleDeselectAll = () => {
    setOnboardingState({ selectedFunctions: [] });
  };

  const handleAnswerScore = (qId: string, score: number) => {
    const current = onboarding.answers[qId] || { score: 0, comment: "", evidence: [] };
    const updatedAnswers = {
      ...onboarding.answers,
      [qId]: { ...current, score }
    };
    setOnboardingState({ answers: updatedAnswers });
  };

  const handleAnswerComment = (qId: string, comment: string) => {
    const current = onboarding.answers[qId] || { score: 0, comment: "", evidence: [] };
    const updatedAnswers = {
      ...onboarding.answers,
      [qId]: { ...current, comment }
    };
    setOnboardingState({ answers: updatedAnswers });
  };

  const handleUploadQuestionEvidence = (qId: string) => {
    const filename = prompt("Enter simulated supporting filename (e.g. Audit_Protocol.pdf):", "System_Process_Workflow.pdf");
    if (filename) {
      const current = onboarding.answers[qId] || { score: 0, comment: "", evidence: [] };
      const updatedAnswers = {
        ...onboarding.answers,
        [qId]: { ...current, evidence: [...current.evidence, filename] }
      };
      setOnboardingState({ answers: updatedAnswers });
      toast.success(`Attached ${filename} to evaluation parameter.`);
    }
  };

  const handleUploadGeneralDocument = () => {
    const filename = prompt("Upload general corporate standard/policy document:", "Strategy_Roadmap_2026.pdf");
    if (filename) {
      setOnboardingState({ evidence: [...onboarding.evidence, filename] });
      toast.success(`Uploaded general supporting evidence: ${filename}`);
    }
  };

  const handleRemoveGeneralDocument = (idx: number) => {
    const updated = onboarding.evidence.filter((_, i) => i !== idx);
    setOnboardingState({ evidence: updated });
  };

  const handleSubmit = () => {
    toast.promise(
      new Promise<boolean>((resolve, reject) => {
        setTimeout(() => {
          const success = registerOnboardingUser();
          if (success) resolve(true);
          else reject(new Error("Registration failed"));
        }, 1500);
      }),
      {
        loading: "Initializing organization profile, compiling report, and building roadmap...",
        success: () => {
          setOnboardingState({ step: 6 });
          // Auto login and redirect
          setTimeout(() => {
            navigate("/");
          }, 3500);
          return "Registration complete! Logging you in...";
        },
        error: "Failed to finalize onboarding. Contact support."
      }
    );
  };

  const progressPercentage = ((onboarding.step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen grid lg:grid-cols-[400px_1fr] bg-background">
      {/* Onboarding Sidebar */}
      <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Maturity IQ</div>
              <div className="text-[10px] opacity-75">Onboarding Wizard</div>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Create baseline profile</h2>
              <p className="text-xs text-white/80 mt-1">Complete this 7-step process to generate your initial dashboard analytics and strategic capabilities roadmap.</p>
            </div>

            {/* Steps Timeline */}
            <div className="relative border-l border-white/20 pl-4 space-y-6 text-xs mt-8">
              {STEPS.map((label, idx) => {
                const active = onboarding.step === idx;
                const done = onboarding.step > idx;
                return (
                  <div key={label} className="relative flex items-center gap-3">
                    <span className={cn(
                      "absolute -left-[23px] flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold",
                      done ? "bg-emerald-500 border-emerald-500 text-white" :
                      active ? "bg-white border-white text-primary" : "bg-primary border-white/30 text-white/50"
                    )}>
                      {done ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                    </span>
                    <span className={cn("font-medium", active ? "text-white font-bold" : done ? "text-white/80" : "text-white/40")}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative text-[11px] opacity-70">
          SOC 2 Security Verified · Data Encrypted at Rest
        </div>
      </div>

      {/* Onboarding Wizard Body */}
      <div className="flex flex-col bg-muted/20 min-h-screen">
        {/* Top Progress bar */}
        <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground">Onboarding Progress</span>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </div>
            <span className="text-xs font-bold text-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          {onboarding.step < 6 && (
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground font-semibold">
              Already have an account? Sign In
            </Link>
          )}
        </div>

        <div className={cn(
          "flex-1 p-8 overflow-y-auto mx-auto w-full transition-all duration-300",
          onboarding.step === 3 ? "max-w-6xl" : "max-w-4xl"
        )}>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
            
            {/* STEP 1: ACCOUNT INFORMATION */}
            {onboarding.step === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Step 1: Account Credentials</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Define login details for accessing your organization's strategy console.</p>
                </div>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" className="mt-1.5" placeholder="e.g. Sarah Malik" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" className="mt-1.5" placeholder="sarah.malik@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="mt-1.5" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="passwordConfirm">Confirm Password</Label>
                    <Input id="passwordConfirm" type="password" className="mt-1.5" placeholder="••••••••••••" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ORGANIZATION PROFILE */}
            {onboarding.step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Step 2: Organization Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Let's build your organization profile and calibrate benchmarking parameters.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input className="mt-1.5" placeholder="e.g. Acme Corporation" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Industry Verticals</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Country Headquarters</Label>
                    <Input className="mt-1.5" placeholder="e.g. UAE, Saudi Arabia" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div>
                    <Label>Number of Employees</Label>
                    <Input className="mt-1.5" type="number" placeholder="e.g. 250" value={employees} onChange={(e) => setEmployees(e.target.value)} />
                  </div>
                  <div>
                    <Label>Annual Revenue</Label>
                    <Select value={revenue} onValueChange={setRevenue}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<$10M">&lt; $10M</SelectItem>
                        <SelectItem value="$10M-$50M">$10M - $50M</SelectItem>
                        <SelectItem value="$50M-$250M">$50M - $250M</SelectItem>
                        <SelectItem value="$250M-$1B">$250M - $1B</SelectItem>
                        <SelectItem value=">$1B">&gt; $1B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Organization Type</Label>
                    <Select value={orgType} onValueChange={setOrgType}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private">Private Enterprise</SelectItem>
                        <SelectItem value="Public">Public Listed Company</SelectItem>
                        <SelectItem value="Government Entity">Government / Public Entity</SelectItem>
                        <SelectItem value="Family Office">Family Conglomerate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Primary Executive Contact</Label>
                    <Input className="mt-1.5" placeholder="e.g. Sarah Malik" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input className="mt-1.5" placeholder="+971 50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SELECT BUSINESS FUNCTIONS */}
            {onboarding.step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Step 3: In-Scope Business Functions</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Select the organizational sectors to analyze. Unselected functions will be excluded from this cycle.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button onClick={handleSelectAll} className="text-primary hover:underline">Select All</button>
                    <span className="text-muted-foreground">|</span>
                    <button onClick={handleDeselectAll} className="text-muted-foreground hover:text-foreground">Deselect All</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {FUNCTION_DEFS.map((func) => {
                    const checked = onboarding.selectedFunctions.includes(func.id);
                    return (
                      <button
                        key={func.id}
                        onClick={() => handleFuncSelectToggle(func.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer",
                          checked
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/20 bg-card"
                        )}
                      >
                        <span className={cn(
                          "h-5 w-5 rounded-md border flex items-center justify-center transition shrink-0",
                          checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                        )}>
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{func.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            Includes: {activeTemplate.functions.find(f => f.id === func.id)?.sections.join(", ") || "Corporate parameters"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: ASSESSMENT QUESTIONNAIRE */}
            {onboarding.step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Step 4: Onboarding Capability Questionnaire</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Answer the operational baseline capability questions across your selected business functions.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                    <Check className="h-3.5 w-3.5" /> <span>Saved</span>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-4 bg-muted/30 border border-border p-4 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Questions Answered</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{answeredCount} / {totalQuestions}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Assessment Complete</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{completionPercentage}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Baseline Rating</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{averageScore} / 5.00</div>
                  </div>
                </div>

                {/* Main Questionnaire Split Screen */}
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-4 pt-4 border-t border-border">
                  {/* Left Sidebar */}
                  <aside className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">Functions</div>
                      <ul className="space-y-1">
                        {onboarding.selectedFunctions.map((fId) => {
                          const def = FUNCTION_DEFS.find((f) => f.id === fId);
                          if (!def) return null;
                          const active = fId === activeFuncId;
                          
                          // Count answered in this function
                          const tempId = getTemplateIdForIndustry(industry);
                          const fQuestions = questions.filter(q => q.id.startsWith(`${tempId}-${fId}-`));
                          const fAnswered = fQuestions.filter(q => onboarding.answers[q.id]?.score > 0).length;
                          const completion = fQuestions.length > 0 ? Math.round((fAnswered / fQuestions.length) * 100) : 0;
                          
                          return (
                            <li key={fId}>
                              <button
                                onClick={() => {
                                  setActiveFuncId(fId);
                                  setActiveSecIdx(0);
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2.5 rounded-md text-xs flex items-center justify-between transition cursor-pointer",
                                  active
                                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                    : "hover:bg-muted text-foreground"
                                )}
                              >
                                <span className="truncate">{def.name}</span>
                                <span className={cn("text-[10px] tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
                                  {completion}%
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Sections Sub-navigation */}
                    {activeFuncDef && (
                      <div className="border-t border-border pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Categories</div>
                        <ul className="space-y-1 text-xs">
                          {activeFuncDef.sections.map((secName, sIdx) => {
                            const isSecActive = sIdx === activeSecIdx;
                            
                            // Calculate average score for this section
                            const tempId = getTemplateIdForIndustry(industry);
                            const secQues = questions.filter((q) => q.id.startsWith(`${tempId}-${activeFuncDef.id}-s${sIdx}-`));
                            let sum = 0;
                            let count = 0;
                            secQues.forEach((q) => {
                              const scoreVal = onboarding.answers[q.id]?.score || 0;
                              if (scoreVal > 0) {
                                sum += scoreVal;
                                count++;
                              }
                            });
                            const secAvg = count > 0 ? sum / count : 0;

                            return (
                              <li key={sIdx}>
                                <button
                                  onClick={() => setActiveSecIdx(sIdx)}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-md transition flex items-center justify-between cursor-pointer",
                                    isSecActive ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <span className="truncate">{secName}</span>
                                  {secAvg > 0 && <span className="text-[10px] opacity-85 tabular-nums">{secAvg.toFixed(1)}★</span>}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </aside>

                  {/* Right Questionnaire Page */}
                  <div className="space-y-6 min-w-0">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{activeFuncDef?.name} — {activeFuncDef?.sections[activeSecIdx]}</h2>
                      <p className="text-xs text-muted-foreground mt-1">Answer the 5 capability evaluation parameters below. Click scores to modify values.</p>
                    </div>

                    {/* Overall Function Progress Bar */}
                    <div className="flex items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{activeFuncDef?.name} Progress</span>
                          <span className="tabular-nums font-semibold text-foreground">{activeFuncCompletion}% Complete</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${activeFuncCompletion}%` }} />
                        </div>
                      </div>
                      <div className="text-center px-4 py-1.5 border-l border-border shrink-0">
                        <div className="text-xs text-muted-foreground">Function Score</div>
                        <div className="text-lg font-bold text-foreground tabular-nums">{activeFuncScore > 0 ? activeFuncScore.toFixed(2) : "—"}</div>
                      </div>
                    </div>

                    {/* Questions Container */}
                    <div className="space-y-6 mt-4">
                      {sectionQuestions.map((q, qIdx) => {
                        const ans = onboarding.answers[q.id] || { score: 0, comment: "", evidence: [] };
                        return (
                          <div key={q.id} className="rounded-xl border border-border p-5 bg-card hover:shadow-sm transition space-y-4 text-left">
                            <div>
                              <div className="flex items-start gap-2">
                                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                  {qIdx + 1}
                                </span>
                                <div className="text-sm font-semibold text-foreground leading-snug">{q.text}</div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1.5 pl-7">{q.description}</div>
                            </div>

                            <div className="pl-7 space-y-4">
                              {/* Rating Control */}
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-muted-foreground font-medium shrink-0">Maturity Rating:</span>
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                      key={num}
                                      onClick={() => handleAnswerScore(q.id, num)}
                                      className={cn(
                                        "h-9 w-9 rounded-lg border text-sm font-semibold transition cursor-pointer",
                                        ans.score === num 
                                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                          : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground bg-background"
                                      )}
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                                  {ans.score === 1 && "Initial (Score: 1)"}
                                  {ans.score === 2 && "Developing (Score: 2)"}
                                  {ans.score === 3 && "Defined (Score: 3)"}
                                  {ans.score === 4 && "Managed (Score: 4)"}
                                  {ans.score === 5 && "Optimized (Score: 5)"}
                                </span>
                              </div>

                              {/* Comments and Uploads */}
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-[10px] font-semibold text-muted-foreground">Comments & Auditing Context</Label>
                                  <Textarea
                                    rows={2}
                                    placeholder="Provide details on current documents, policies, or organizational gaps..."
                                    className="mt-1.5 text-xs"
                                    value={ans.comment}
                                    onChange={(e) => handleAnswerComment(q.id, e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-semibold text-muted-foreground">Evidence Documents</Label>
                                  <div className="mt-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-lg text-xs">
                                    <div className="flex-1 min-w-0">
                                      {ans.evidence.length > 0 ? (
                                        <div className="space-y-1">
                                          {ans.evidence.map((fName, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-foreground font-medium truncate">
                                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span>{fName}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground italic text-[11px]">No evidence uploaded.</span>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUploadQuestionEvidence(q.id)}
                                      className="gap-1.5 shrink-0 text-xs cursor-pointer"
                                    >
                                      <Upload className="h-3.5 w-3.5" /> Upload Evidence
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation inside questionnaire */}
                    <div className="flex justify-between pt-6 border-t border-border mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activeSecIdx === 0 && activeFuncId === onboarding.selectedFunctions[0]}
                        onClick={() => {
                          if (activeSecIdx > 0) {
                            setActiveSecIdx(activeSecIdx - 1);
                          } else {
                            const curIdx = onboarding.selectedFunctions.indexOf(activeFuncId);
                            if (curIdx > 0) {
                              const prevFId = onboarding.selectedFunctions[curIdx - 1];
                              const prevDef = activeTemplate.functions.find(f => f.id === prevFId);
                              setActiveFuncId(prevFId);
                              setActiveSecIdx((prevDef?.sections.length || 1) - 1);
                            }
                          }
                        }}
                      >
                        Previous Category
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          activeSecIdx === (activeFuncDef?.sections.length || 1) - 1 &&
                          activeFuncId === onboarding.selectedFunctions[onboarding.selectedFunctions.length - 1]
                        }
                        onClick={() => {
                          if (activeSecIdx < (activeFuncDef?.sections.length || 1) - 1) {
                            setActiveSecIdx(activeSecIdx + 1);
                          } else {
                            const curIdx = onboarding.selectedFunctions.indexOf(activeFuncId);
                            if (curIdx < onboarding.selectedFunctions.length - 1) {
                              setActiveFuncId(onboarding.selectedFunctions[curIdx + 1]);
                              setActiveSecIdx(0);
                            }
                          }
                        }}
                      >
                        Next Category
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SUPPORTING DOCUMENTS */}
            {onboarding.step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Step 5: Corporate Document Repository</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload general corporate planning, strategy drafts, organizational charts, or framework standards.</p>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center max-w-lg mx-auto bg-muted/10">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/80 mx-auto" />
                  <h4 className="text-sm font-semibold text-foreground mt-3">Upload baseline documents</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Upload strategic blueprints, governance mandates, or operational workflows supporting your capability profiles.</p>
                  <Button variant="outline" className="mt-4 gap-1.5" onClick={handleUploadGeneralDocument}>
                    <Upload className="h-4 w-4" /> Select files
                  </Button>
                </div>

                {onboarding.evidence.length > 0 && (
                  <div className="max-w-lg mx-auto space-y-2 mt-6">
                    <Label className="text-xs font-semibold text-muted-foreground">General Supporting Documents ({onboarding.evidence.length})</Label>
                    <div className="space-y-1.5">
                      {onboarding.evidence.map((fName, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-card border border-border p-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground truncate">{fName}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600 cursor-pointer" onClick={() => handleRemoveGeneralDocument(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: REVIEW & SUBMIT */}
            {onboarding.step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Step 6: Baseline Review & Submission</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Validate your credentials and organization profile data prior to baseline assessment compilation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Information</h4>
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Full Name:</span><span className="font-semibold text-foreground">{fullName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Work Email:</span><span className="font-semibold text-foreground">{email}</span></div>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization Profile</h4>
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-semibold text-foreground">{orgName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Industry Sector:</span><span className="font-semibold text-foreground">{industry}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Country HQ:</span><span className="font-semibold text-foreground">{country}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Employees:</span><span className="font-semibold text-foreground">{employees} staff</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Annual Revenue:</span><span className="font-semibold text-foreground">{revenue}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Entity Type:</span><span className="font-semibold text-foreground">{orgType}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Maturity Questionnaire Baseline</h4>
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Evaluation Scope:</span><span className="font-semibold text-foreground">{onboarding.selectedFunctions.length} Functions selected</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Questions Answered:</span><span className="font-semibold text-foreground">{answeredCount} of {totalQuestions}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Completion Rate:</span><span className="font-semibold text-foreground">{completionPercentage}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Average Baseline Score:</span><span className="font-semibold text-foreground">{averageScore} / 5.00</span></div>
                      
                      <div className="pt-2 border-t border-border/60">
                        <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">Scope of Functions</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {onboarding.selectedFunctions.map((fId) => (
                            <span key={fId} className="bg-primary/10 border border-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-semibold">
                              {FUNCTION_DEFS.find((f) => f.id === fId)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Uploaded Documents</h4>
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Parameter Evidence:</span><span className="font-semibold text-foreground">{Object.values(onboarding.answers).reduce((sum, ans) => sum + ans.evidence.length, 0)} files</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">General Corporate Files:</span><span className="font-semibold text-foreground">{onboarding.evidence.length} files</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: REGISTRATION SUCCESS */}
            {onboarding.step === 6 && (
              <div className="text-center py-10 space-y-6">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-md">
                  <Check className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Welcome to Maturity IQ!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your baseline organizational capability profile has been compiled. Generating gap-analysis dashboards and continuous roadmap tracker...
                  </p>
                </div>
                <div className="pt-4 max-w-xs mx-auto">
                  <Progress value={100} className="h-1.5" />
                  <span className="text-[10px] text-muted-foreground block mt-2">Authenticating workspace & launching console...</span>
                </div>
                <Button onClick={() => navigate("/")} className="gap-2 mt-6">
                  Access Strategy Console <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Navigation buttons */}
            {onboarding.step < 6 && (
              <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
                <Button variant="outline" onClick={handlePrev} disabled={onboarding.step === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
                <Button onClick={handleNext} className="gap-1.5">
                  {onboarding.step === 5 ? (
                    <>Submit Baseline & Register <Sparkles className="h-4 w-4 ml-1.5" /></>
                  ) : (
                    <>Continue <ChevronRight className="h-4 w-4 ml-1.5" /></>
                  )}
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
