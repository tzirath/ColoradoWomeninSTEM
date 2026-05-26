"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50";

const STEM_AREAS = [
  "Biology / Life Sciences",
  "Chemistry",
  "Computer Science / Software",
  "Data Science / Analytics",
  "Engineering",
  "Environmental Science",
  "Healthcare / Medicine",
  "Mathematics / Statistics",
  "Physics",
  "Other",
];

const ETHNIC_BACKGROUNDS = [
  "Black / African American",
  "Indigenous / Native American / Alaska Native",
  "Asian (East, Southeast, South, West/SWANA, Pacific Islander/Native Hawaiian)",
  "Latina / Hispanic",
  "White / European",
  "Prefer not to say",
  "Not listed",
];

const CAREER_STAGES = [
  "Student",
  "Early career (0–3 yrs)",
  "Mid-career",
  "Senior / Leadership",
  "Career changer",
  "Entrepreneur / Founder",
];


const HOW_FOUND = [
  "Word of mouth",
  "LinkedIn",
  "Instagram",
  "Google / web search",
  "Event or meetup",
];

const INTERESTS = [
  "Talks & Panels",
  "Workshops",
  "Networking",
  "Mentorship",
  "Job Opportunities",
  "Community Events",
  "Volunteering",
];

const STEPS = ["Basic info", "Identity & community", "STEM context", "Interests & location"];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-body text-xs text-muted-foreground mb-2 uppercase tracking-wide">
      {children}
      {required && <span className="text-secondary ml-1 normal-case font-semibold">*</span>}
    </label>
  );
}

function PillRadio({ label, selected, onClick, disabled }: {
  label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-body text-sm px-4 py-2 rounded-full border transition-colors ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-foreground/80 border-border hover:border-primary/60 hover:text-foreground"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

const JoinModal = ({ open, onClose }: JoinModalProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [step, setStep] = useState(1);

  // Step 1 — Basic info
  const [firstName, setFirstName] = useState("");
  const [email, setEmail]         = useState("");

  // Step 2 — Identity & community
  const [joiningAs,        setJoiningAs]        = useState("");
  const [ethnicBackground, setEthnicBackground] = useState<string[]>([]);
  const [ethnicOther,      setEthnicOther]      = useState("");

  // Step 3 — STEM context
  const [stemArea,      setStemArea]      = useState("");
  const [stemAreaOther, setStemAreaOther] = useState("");
  const [careerStage,   setCareerStage]   = useState("");

  // Step 4 — Interests & location
  const [howFound,       setHowFound]       = useState("");
  const [hopes,          setHopes]          = useState("");
  const [interests,      setInterests]      = useState<string[]>([]);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success,      setSuccess]      = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else {
      setStep(1);
      setFirstName(""); setEmail("");
      setJoiningAs(""); setEthnicBackground([]); setEthnicOther("");
      setStemArea(""); setStemAreaOther(""); setCareerStage("");
      setHowFound(""); setHopes(""); setInterests([]);
      setNewsletterOptIn(true); setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const stepValid = [
    firstName.trim().length > 0 && emailValid,
    joiningAs !== "" && ethnicBackground.length > 0,
    stemArea !== "" && (stemArea !== "Other" || stemAreaOther.trim().length > 0) && careerStage !== "",
    true,
  ];
  const canAdvance = stepValid[step - 1];

  const toggleInterest  = (v: string) =>
    setInterests((p)        => p.includes(v) ? p.filter((i) => i !== v) : [...p, v]);
  const toggleEthnicity = (v: string) =>
    setEthnicBackground((p) => p.includes(v) ? p.filter((i) => i !== v) : [...p, v]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step < 4) {
      if (canAdvance) setStep(step + 1);
      return;
    }
    if (!executeRecaptcha) {
      toast.error("Security check not ready — please refresh and try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("subscribe");

      const ethnicFinal =
        ethnicBackground.includes("Not listed") && ethnicOther.trim()
          ? [...ethnicBackground.filter((v) => v !== "Not listed"), `Not listed: ${ethnicOther.trim()}`]
          : ethnicBackground;

      const stemAreaFinal = stemArea === "Other" && stemAreaOther.trim()
        ? `Other: ${stemAreaOther.trim()}`
        : stemArea;

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          joiningAs,
          ethnicBackground: ethnicFinal,
          stemArea: stemAreaFinal,
          careerStage,
          howFound: howFound || null,
          hopes: hopes.trim() || null,
          interests,
          newsletterOptIn,
          recaptchaToken,
        }),
      });

      const data = (await res.json()) as { success?: boolean; alreadyMember?: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.alreadyMember) toast.success("You're already part of CWS! Great to see you.");
      } else {
        toast.error(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🌸</div>
            <h2 className="font-display text-2xl font-bold text-primary mb-2">Welcome to CWS!</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              You&apos;re in, {firstName}. We&apos;ll keep you in the loop on upcoming events, resources, and community updates.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-secondary text-secondary-foreground font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2 id="join-modal-title" className="font-display text-2xl font-bold text-primary mb-1">
                Join CWS<span className="text-secondary">.</span>
              </h2>
              <p className="font-body text-muted-foreground text-sm">
                Sign up to stay connected with Colorado Women in STEM.
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-1">
              {STEPS.map((_, i) => {
                const num = i + 1;
                const done   = num < step;
                const active = num === step;
                return (
                  <Fragment key={num}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-body font-bold border-2 shrink-0 transition-all ${
                      done   ? "bg-secondary border-secondary text-white" :
                      active ? "bg-primary border-primary text-primary-foreground" :
                               "border-border text-muted-foreground"
                    }`}>
                      {done ? "✓" : num}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 transition-colors ${done ? "bg-secondary" : "bg-border"}`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
            <p className="font-body text-xs text-muted-foreground mb-5">
              Step {step} of 4 —{" "}
              <span className="text-foreground font-medium">{STEPS[step - 1]}</span>
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>

              {/* ── Step 1: Basic info ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    disabled={isSubmitting}
                    required
                    maxLength={100}
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    disabled={isSubmitting}
                    required
                    maxLength={254}
                  />
                </div>
              )}

              {/* ── Step 2: Identity & community ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-body text-xs text-foreground/75 leading-relaxed mb-3 bg-primary/5 rounded-lg px-3 py-2.5 border border-primary/15">
                      CWS centers Black, Indigenous, Asian, Pacific Islander, and Latina women in STEM. All women are welcome — we just want to understand who&apos;s in the room.
                    </p>
                    <FieldLabel required>How you&apos;re joining</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "woc",  label: "I identify as a woman of color" },
                        { value: "ally", label: "I'm joining as an ally" },
                      ].map(({ value, label }) => (
                        <PillRadio
                          key={value}
                          label={label}
                          selected={joiningAs === value}
                          onClick={() => setJoiningAs(value)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Ethnic background</FieldLabel>
                    <p className="font-body text-xs text-muted-foreground mb-3">
                      This helps us understand our community and ensure our programming reflects who we&apos;re here to serve. Select all that apply.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {ETHNIC_BACKGROUNDS.map((bg) => (
                        <label key={bg} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={ethnicBackground.includes(bg)}
                            onChange={() => toggleEthnicity(bg)}
                            disabled={isSubmitting}
                            className="accent-secondary shrink-0"
                          />
                          <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                            {bg}
                          </span>
                        </label>
                      ))}
                    </div>
                    {ethnicBackground.includes("Not listed") && (
                      <input
                        type="text"
                        placeholder="Please specify…"
                        value={ethnicOther}
                        onChange={(e) => setEthnicOther(e.target.value)}
                        className={inputClass + " mt-3"}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: STEM context ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel required>STEM Area</FieldLabel>
                    <select
                      value={stemArea}
                      onChange={(e) => setStemArea(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClass + " cursor-pointer"}
                    >
                      <option value="">Select your field…</option>
                      {STEM_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    {stemArea === "Other" && (
                      <input
                        type="text"
                        placeholder="Please specify your field…"
                        value={stemAreaOther}
                        onChange={(e) => setStemAreaOther(e.target.value)}
                        className={inputClass + " mt-3"}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Career stage</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {CAREER_STAGES.map((stage) => (
                        <PillRadio
                          key={stage}
                          label={stage}
                          selected={careerStage === stage}
                          onClick={() => setCareerStage(stage)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Interests & location ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>How did you find us?</FieldLabel>
                    <select
                      value={howFound}
                      onChange={(e) => setHowFound(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClass + " cursor-pointer"}
                    >
                      <option value="">Select…</option>
                      {HOW_FOUND.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel>I&apos;m interested in</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => {
                        const selected = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => toggleInterest(interest)}
                            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              selected
                                ? "bg-secondary text-secondary-foreground border-secondary"
                                : "bg-transparent text-muted-foreground border-border hover:border-secondary/50 hover:text-foreground"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>What are you hoping to get from CWS?</FieldLabel>
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      Optional — tell us in your own words.
                    </p>
                    <textarea
                      value={hopes}
                      onChange={(e) => setHopes(e.target.value)}
                      placeholder="Tell us what brought you here…"
                      rows={3}
                      maxLength={500}
                      disabled={isSubmitting}
                      className={inputClass + " resize-none"}
                    />
                    <p className="font-body text-xs text-muted-foreground/50 mt-1 text-right">
                      {hopes.length}/500
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      disabled={isSubmitting}
                      className="mt-0.5 accent-secondary shrink-0"
                    />
                    <span className="font-body text-xs text-muted-foreground/60 leading-relaxed group-hover:text-muted-foreground transition-colors">
                      Send me newsletters and updates about events and opportunities.
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    key="continue"
                    type="button"
                    onClick={() => canAdvance && setStep(step + 1)}
                    disabled={!canAdvance || isSubmitting}
                    className="bg-primary text-primary-foreground font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    key="submit"
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="bg-secondary text-secondary-foreground font-body font-semibold px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Joining…</>
                    ) : "Join the Community"}
                  </button>
                )}
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinModal;
