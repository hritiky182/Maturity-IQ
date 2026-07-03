import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore, Answer } from "@/lib/store";
import { INDUSTRY_TEMPLATES, Organization } from "@/lib/mock-data";
import { getAssessmentDepartments, departmentScore, sectionScore, maturityColor, maturityLevel, departmentCompletion } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Save, Upload, FileText, X, Building, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { key: "org", label: "Organization" },
  { key: "dept", label: "Business Functions" },
  { key: "questions", label: "Questionnaire" },
  { key: "review", label: "Review & Submit" },
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

export default function WizardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get("id");

  // Store actions
  const assessments = useStore((state) => state.assessments);
  const answers = useStore((state) => state.answers);
  const questions = useStore((state) => state.questions);
  const createAssessment = useStore((state) => state.createAssessment);
  const updateAssessment = useStore((state) => state.updateAssessment);
  const saveAnswer = useStore((state) => state.saveAnswer);
  const regenerateRecommendations = useStore((state) => state.regenerateRecommendations);

  // Load existing assessment if ID is provided
  const existingAsm = useMemo(() => {
    return assessments.find((a) => a.id === idParam) || null;
  }, [assessments, idParam]);

  // Wizard Steps
  const [step, setStep] = useState(0);

  // Form Fields - Step 1
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Real Estate");
  const [country, setCountry] = useState("UAE");
  const [employees, setEmployees] = useState("1200");
  const [revenue, setRevenue] = useState("$250M");
  const [companyType, setCompanyType] = useState("Private");
  const [year, setYear] = useState("2026");
  const [contactPerson, setContactPerson] = useState("Sarah Malik");
  const [email, setEmail] = useState("sarah.malik@maturityiq.com");
  const [phone, setPhone] = useState("+971 50 123 4567");

  // Helper to map industry string to template ID
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

  // Selected Business Functions - Step 2
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  // Set default business functions once activeTemplate loads
  useEffect(() => {
    if (!existingAsm && activeTemplate) {
      setSelectedDepts(activeTemplate.functions.slice(0, 5).map((f) => f.id));
    }
  }, [activeTemplate, existingAsm]);

  // Step 3 state
  const [activeDepIdx, setActiveDepIdx] = useState(0);
  const [activeSecIdx, setActiveSecIdx] = useState(0);
  const [autoSavedTime, setAutoSavedTime] = useState<string>("Saved");

  // Load state from assessment if resuming
  useEffect(() => {
    if (existingAsm) {
      setCompanyName(existingAsm.company);
      setYear(String(existingAsm.year));
      setSelectedDepts(existingAsm.departments);
      setContactPerson(existingAsm.contactPerson || "Sarah Malik");
      setEmail(existingAsm.email || "");
      setPhone(existingAsm.phone || "");
      
      // Determine industry string based on assessment template ID
      let matchedInd = "Real Estate";
      if (existingAsm.industry === "healthcare") matchedInd = "Healthcare";
      else if (existingAsm.industry === "government") matchedInd = "Government";
      else if (existingAsm.industry === "education") matchedInd = "Education";
      else if (existingAsm.industry === "general") matchedInd = "Technology";
      setIndustry(matchedInd);

      if (existingAsm.completion === 100) {
        setStep(3); // Review
      } else {
        setStep(2); // Questionnaire
      }
    } else {
      setStep(0); // Org Info
    }
  }, [idParam, existingAsm]);

  // Get active business function and category section
  const currentDepId = selectedDepts[activeDepIdx] || selectedDepts[0];
  const depDef = activeTemplate.functions.find((d) => d.id === currentDepId) || activeTemplate.functions[0];
  const currentSectionName = depDef?.sections[activeSecIdx] || depDef?.sections[0] || "Section 1";
  const currentSectionId = depDef ? `${depDef.id}-s${activeSecIdx}` : `strategy-s0`;

  // Get questions in current section
  const sectionQuestions = useMemo(() => {
    const tempId = getTemplateIdForIndustry(industry);
    return questions.filter((q) => q.id.startsWith(`${tempId}-${currentSectionId}-`));
  }, [questions, currentSectionId, industry]);

  // Get answers for the current assessment
  const asmAnswers = useMemo(() => {
    if (!idParam) return {};
    return answers[idParam] || {};
  }, [answers, idParam]);

  // Construct active function details for scoring display
  const activeFunctions = useMemo(() => {
    if (!idParam) return [];
    return getAssessmentDepartments(idParam);
  }, [idParam, answers]);

  const activeDep = activeFunctions.find((d) => d.id === currentDepId) || activeFunctions[0];

  const triggerAutoSaveTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAutoSavedTime(`Auto-saved at ${timeStr}`);
  };

  // Handle Answer Changes
  const handleScoreChange = (qId: string, score: number) => {
    if (!idParam) return;
    const currentAns = asmAnswers[qId] || { score: 0, comment: "", evidence: [] };
    saveAnswer(idParam, qId, {
      ...currentAns,
      score,
    });
    triggerAutoSaveTime();
  };

  const handleCommentChange = (qId: string, comment: string) => {
    if (!idParam) return;
    const currentAns = asmAnswers[qId] || { score: 0, comment: "", evidence: [] };
    saveAnswer(idParam, qId, {
      ...currentAns,
      comment,
    });
    triggerAutoSaveTime();
  };

  const handleFileUpload = (qId: string) => {
    if (!idParam) return;
    const filename = prompt("Enter mock document name to upload (e.g. Audit_Trail_AuditPolicy.pdf):");
    if (!filename) return;

    const currentAns = asmAnswers[qId] || { score: 0, comment: "", evidence: [] };
    saveAnswer(idParam, qId, {
      ...currentAns,
      evidence: [...currentAns.evidence, filename],
    });
    toast.success(`File "${filename}" uploaded as evidence`);
    triggerAutoSaveTime();
  };

  const handleRemoveFile = (qId: string, fileIdx: number) => {
    if (!idParam) return;
    const currentAns = asmAnswers[qId] || { score: 0, comment: "", evidence: [] };
    const updatedEv = [...currentAns.evidence];
    updatedEv.splice(fileIdx, 1);
    
    saveAnswer(idParam, qId, {
      ...currentAns,
      evidence: updatedEv,
    });
    toast.info("Evidence file removed");
    triggerAutoSaveTime();
  };

  // Validation & Navigation Actions
  const handleStep1Submit = () => {
    if (!companyName.trim()) {
      toast.error("Organization Name is required");
      return;
    }
    if (!contactPerson.trim()) {
      toast.error("Contact Person is required");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email is required");
      return;
    }

    if (!idParam) {
      // Create new assessment
      const tempId = getTemplateIdForIndustry(industry);
      const newAsmId = createAssessment({
        name: `${year} Capability Assessment`,
        company: companyName,
        status: "Draft",
        year: parseInt(year),
        industry: tempId,
        departments: selectedDepts,
        sponsor: contactPerson,
        contactPerson,
        email,
        phone,
      });

      setSearchParams({ id: newAsmId });
      toast.success("Assessment draft initialized");
    } else {
      // Update existing
      const tempId = getTemplateIdForIndustry(industry);
      updateAssessment(idParam, {
        company: companyName,
        year: parseInt(year),
        name: `${year} Capability Assessment`,
        industry: tempId,
        contactPerson,
        email,
        phone,
      });
    }

    setStep(1); // Proceed to functions
  };

  const handleStep2Submit = () => {
    if (selectedDepts.length === 0) {
      toast.error("Please select at least one business function to assess");
      return;
    }

    if (idParam) {
      updateAssessment(idParam, {
        departments: selectedDepts,
      });
    }

    setStep(2); // Proceed to questions
  };

  const handleSubmitAssessment = () => {
    if (!idParam) return;
    
    // Complete the assessment
    updateAssessment(idParam, {
      status: "Submitted",
    });

    // Generate dynamic recommendations
    regenerateRecommendations(idParam);

    toast.success("Assessment submitted successfully!");
    navigate("/assessments");
  };

  // Step 2 Helper Actions
  const handleSelectAllDepts = () => {
    setSelectedDepts(activeTemplate.functions.map((f) => f.id));
    toast.success(`All ${activeTemplate.functions.length} functions selected`);
  };

  const handleDeselectAllDepts = () => {
    setSelectedDepts([]);
  };

  // Step 3 Questionnaire Navigations
  const handleNextSection = () => {
    if (activeSecIdx < depDef.sections.length - 1) {
      setActiveSecIdx((s) => s + 1);
    } else {
      // Move to next business function
      if (activeDepIdx < selectedDepts.length - 1) {
        setActiveDepIdx((d) => d + 1);
        setActiveSecIdx(0);
        toast.info(`Moving to ${activeTemplate.functions.find((f) => f.id === selectedDepts[activeDepIdx + 1])?.name} questionnaire`);
      } else {
        // Last function, go to Step 4 Review
        setStep(3);
      }
    }
  };

  const handlePrevSection = () => {
    if (activeSecIdx > 0) {
      setActiveSecIdx((s) => s - 1);
    } else {
      // Move to previous function
      if (activeDepIdx > 0) {
        setActiveDepIdx((d) => d - 1);
        setActiveSecIdx(4); // Last section of previous function
        toast.info(`Moving back to ${activeTemplate.functions.find((f) => f.id === selectedDepts[activeDepIdx - 1])?.name}`);
      } else {
        // First function, first section: Go back to Step 2 selection
        setStep(1);
      }
    }
  };

  // Count total uploaded files across this assessment
  const totalUploadedFilesCount = useMemo(() => {
    let count = 0;
    Object.values(asmAnswers).forEach((ans) => {
      count += ans.evidence?.length || 0;
    });
    return count;
  }, [asmAnswers]);

  return (
    <PageShell
      title={existingAsm ? `Resume assessment: ${existingAsm.id}` : "New assessment"}
      description="Configure and launch a new organizational maturity assessment."
      actions={<Button variant="outline" asChild><Link to="/assessments">Cancel</Link></Button>}
    >
      {/* Stepper Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
        <ol className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-3 flex-1">
              <button 
                onClick={() => idParam && step >= i && setStep(i)} 
                disabled={!idParam || i > step}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0 cursor-pointer disabled:cursor-not-allowed",
                  i < step ? "bg-primary text-primary-foreground"
                  : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                  : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <div className="min-w-0">
                <div className={cn("text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  Step {i + 1}
                </div>
                <div className="text-sm font-medium truncate text-foreground">{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className="hidden sm:block h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>
      </div>

      {/* STEP 1: ORGANIZATION INFORMATION */}
      {step === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground font-sans">Organization Information</h2>
          <p className="text-sm text-muted-foreground">Specify the properties, parameters, and industry context of the target organization.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Organization Name</Label>
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="e.g. Emaar Properties"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Industry Sector</Label>
              <Select value={industry} onValueChange={(val) => setIndustry(val)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Country</Label>
              <Input 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                placeholder="e.g. UAE"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Number of Employees</Label>
              <Input 
                type="number" 
                value={employees} 
                onChange={(e) => setEmployees(e.target.value)} 
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Annual Revenue</Label>
              <Input 
                value={revenue} 
                onChange={(e) => setRevenue(e.target.value)} 
                placeholder="e.g. $250M"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Organization Type</Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public Enterprise</SelectItem>
                  <SelectItem value="Private">Private Company</SelectItem>
                  <SelectItem value="Government">Government Entity</SelectItem>
                  <SelectItem value="Family">Family Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Assessment Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">FY 2026</SelectItem>
                  <SelectItem value="2025">FY 2025</SelectItem>
                  <SelectItem value="2024">FY 2024</SelectItem>
                  <SelectItem value="2023">FY 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Contact Person</Label>
              <Input 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. name@domain.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Phone Number</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +971 50 123 4567"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleStep1Submit}>
              Continue to Business Functions <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: BUSINESS FUNCTION SELECTION */}
      {step === 1 && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Select Business Functions</h2>
              <p className="text-sm text-muted-foreground">Choose the functional areas in scope for this assessment template ({activeTemplate.name}).</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAllDepts}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={handleDeselectAllDepts} className="text-rose-600">Deselect All</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTemplate.functions.map((f) => {
              const isSelected = selectedDepts.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => 
                    setSelectedDepts((s) => 
                      isSelected ? s.filter((x) => x !== f.id) : [...s, f.id]
                    )
                  }
                  className={cn(
                    "text-left rounded-xl border p-4 transition cursor-pointer bg-card",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30" 
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{f.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{f.sections.length} categories · 25 parameters</div>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded flex items-center justify-center border",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={handleStep2Submit}>
              Continue to Questionnaire <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: QUESTIONNAIRE SYSTEM */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Left Sidebar */}
          <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm h-fit space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">Functions</div>
              <ul className="space-y-1">
                {selectedDepts.map((id, i) => {
                  const dName = activeTemplate.functions.find((x) => x.id === id)?.name || id;
                  const dObj = activeFunctions.find((x) => x.id === id);
                  const completion = dObj ? departmentCompletion(dObj) : 0;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => { setActiveDepIdx(i); setActiveSecIdx(0); }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center justify-between transition cursor-pointer",
                          i === activeDepIdx 
                            ? "bg-primary text-primary-foreground font-medium" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="truncate">{dName}</span>
                        <span className={cn("text-[10px] tabular-nums", i === activeDepIdx ? "opacity-80" : "text-muted-foreground")}>
                          {completion}%
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sections Sub-navigation */}
            {activeDep && (
              <div className="border-t border-border pt-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Categories</div>
                <ul className="space-y-1 text-xs">
                  {depDef.sections.map((secName, sIdx) => {
                    const isSecActive = sIdx === activeSecIdx;
                    const secObj = activeDep.sections[sIdx];
                    const secAvg = secObj ? sectionScore(secObj) : 0;
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
                          {secAvg > 0 && <span className="text-[10px] opacity-80 tabular-nums">{secAvg.toFixed(1)}★</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          {/* Right Questionnaire Page */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{depDef?.name} — {currentSectionName}</h2>
                <p className="text-sm text-muted-foreground mt-1">Answer the 5 capability evaluation parameters below. Click scores to modify values.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                <Save className="h-3.5 w-3.5" /> <span>{autoSavedTime}</span>
              </div>
            </div>

            {/* Overall Function Progress Bar */}
            {activeDep && (
              <div className="flex items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{depDef?.name} Progress</span>
                    <span className="tabular-nums font-semibold text-foreground">{departmentCompletion(activeDep)}% Complete</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${departmentCompletion(activeDep)}%` }} />
                  </div>
                </div>
                <div className="text-center px-4 py-1.5 border-l border-border shrink-0">
                  <div className="text-xs text-muted-foreground">Function Score</div>
                  <div className="text-xl font-bold text-foreground tabular-nums">{departmentScore(activeDep).toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Questions Container */}
            <div className="space-y-6 mt-4">
              {sectionQuestions.map((q, qIdx) => {
                const ans = asmAnswers[q.id] || { score: 0, comment: "", evidence: [] };
                return (
                  <div key={q.id} className="rounded-xl border border-border p-5 bg-card hover:shadow-sm transition space-y-4">
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
                      {/* Rating Control depending on Type */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-muted-foreground font-medium shrink-0">Maturity Rating:</span>
                        
                        {/* 1. Rating Type */}
                        {q.type === "rating" && (
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                onClick={() => handleScoreChange(q.id, num)}
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
                        )}

                        {/* 2. Yes/No Type */}
                        {q.type === "yesno" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleScoreChange(q.id, 5)}
                              className={cn(
                                "px-4 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer",
                                ans.score === 5 
                                  ? "bg-emerald-600 text-white border-emerald-600" 
                                  : "border-border text-muted-foreground hover:text-foreground bg-background"
                              )}
                            >
                              Yes (5)
                            </button>
                            <button
                              onClick={() => handleScoreChange(q.id, 1)}
                              className={cn(
                                "px-4 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer",
                                ans.score === 1 
                                  ? "bg-rose-600 text-white border-rose-600" 
                                  : "border-border text-muted-foreground hover:text-foreground bg-background"
                              )}
                            >
                              No (1)
                            </button>
                          </div>
                        )}

                        {/* 3. Single Select Type */}
                        {q.type === "single" && q.choices && (
                          <Select 
                            value={ans.score > 0 ? String(ans.score) : undefined} 
                            onValueChange={(val) => handleScoreChange(q.id, parseInt(val))}
                          >
                            <SelectTrigger className="w-56 h-9"><SelectValue placeholder="Select maturity tier" /></SelectTrigger>
                            <SelectContent>
                              {q.choices.map((choice, cIdx) => {
                                const scoreMap = [1, 2, 4, 5];
                                const scoreVal = scoreMap[cIdx] || 1;
                                return (
                                  <SelectItem key={choice} value={String(scoreVal)}>
                                    {choice} ({scoreVal})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}

                        {/* 4. Multi Select Type */}
                        {q.type === "multi" && q.choices && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 bg-muted/30 p-2.5 rounded-lg border border-border">
                            {q.choices.map((choice, cIdx) => {
                              const isChecked = ans.score > 1 ? ans.score >= (cIdx + 2) : false;
                              return (
                                <label key={choice} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let newScore = 1;
                                      if (e.target.checked) {
                                        newScore = Math.min(5, (ans.score || 1) + 1);
                                      } else {
                                        newScore = Math.max(1, (ans.score || 1) - 1);
                                      }
                                      handleScoreChange(q.id, newScore);
                                    }}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                  />
                                  <span>{choice}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* 5. Text Type */}
                        {q.type === "text" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Self-assessed rating:</span>
                            <input 
                              type="range" 
                              min="1" 
                              max="5" 
                              value={ans.score || 1} 
                              onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
                              className="w-28 accent-primary"
                            />
                            <span className="text-xs font-semibold tabular-nums text-foreground">{ans.score || 1} / 5</span>
                          </div>
                        )}

                        <span className="text-xs font-semibold text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded">
                          {ans.score > 0 ? `${maturityLevel(ans.score)} (Score: ${ans.score})` : "Unanswered"}
                        </span>
                      </div>

                      {/* Comment Input */}
                      <div>
                        <Label className="text-[11px] text-muted-foreground font-medium">Comments & Auditing Context</Label>
                        <Textarea 
                          placeholder="Provide details on current documents, policies, or organizational gaps..." 
                          value={ans.comment}
                          onChange={(e) => handleCommentChange(q.id, e.target.value)}
                          className="mt-1 min-h-[64px] text-xs leading-relaxed" 
                        />
                      </div>

                      {/* Evidence Files List & Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] text-muted-foreground font-medium">Evidence Documents</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleFileUpload(q.id)}
                            className="h-7 text-[10px] px-2.5"
                          >
                            <Upload className="h-3 w-3 mr-1" /> Upload Evidence
                          </Button>
                        </div>
                        {ans.evidence && ans.evidence.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ans.evidence.map((fileName, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-lg text-[10px] text-foreground">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="max-w-[150px] truncate">{fileName}</span>
                                <button 
                                  onClick={() => handleRemoveFile(q.id, fIdx)}
                                  className="text-muted-foreground hover:text-rose-600 transition"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground italic pl-1">No evidence uploaded.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stepper Footer Controls */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handlePrevSection}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous Section
              </Button>
              <Button onClick={handleNextSection}>
                Next Section <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 3 && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
            <p className="text-sm text-muted-foreground">Confirm the assessment details and business function completion scores before final submission.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-xl border border-border">
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Organization Summary</h3>
              <div className="text-sm text-foreground space-y-1">
                <div>Organization Name: <span className="font-semibold">{companyName}</span></div>
                <div>Industry Sector: <span className="font-semibold">{industry}</span></div>
                <div>Year: <span className="font-semibold">FY {year}</span></div>
                <div>Contact Person: <span className="font-semibold">{contactPerson}</span></div>
                <div>Email Address: <span className="font-semibold">{email}</span></div>
                <div>Phone Number: <span className="font-semibold">{phone}</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Assessment Summary</h3>
              <div className="text-sm text-foreground space-y-1">
                <div>Assessment ID: <span className="font-semibold">{idParam}</span></div>
                <div>Status: <span className="font-semibold text-primary">{existingAsm?.status || "Draft"}</span></div>
                <div>Selected Functions: <span className="font-semibold">{selectedDepts.length} of {activeTemplate.functions.length}</span></div>
                <div>Supporting Documents: <span className="font-semibold">{totalUploadedFilesCount} uploaded files</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Calculated Business Function Scores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedDepts.map((id) => {
                const dObj = activeFunctions.find((x) => x.id === id);
                const score = dObj ? departmentScore(dObj) : 0;
                const completion = dObj ? departmentCompletion(dObj) : 0;
                const dName = activeTemplate.functions.find((x) => x.id === id)?.name || id;

                return (
                  <div key={id} className="rounded-xl border border-border p-4 bg-card shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{dName}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground tabular-nums">
                          {score > 0 ? score.toFixed(2) : "0.0"}
                        </span>
                        {score > 0 && (
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-semibold", maturityColor(score))}>
                            {maturityLevel(score)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Completion:</span>
                      <span className="font-semibold text-foreground tabular-nums">{completion}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 flex items-center gap-3 bg-muted/40">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-foreground leading-snug">
              By submitting this assessment, the scores will be locked into the database. You will immediately see the resulting <Link to="/gap-analysis" className="text-primary font-semibold hover:underline">Gap Analysis</Link>, <Link to="/recommendations" className="text-primary font-semibold hover:underline">Recommendations</Link>, and <Link to="/roadmap" className="text-primary font-semibold hover:underline">Transformation Roadmap</Link>.
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Questionnaire
            </Button>
            <Button onClick={handleSubmitAssessment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="h-4 w-4 mr-1" /> Submit Assessment
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
