"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
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

const INTERESTS = [
  "Talks & Panels",
  "Workshops",
  "Networking",
  "Mentorship",
  "Job Opportunities",
  "Community Events",
  "Volunteering",
];

const JoinModal = ({ open, onClose }: JoinModalProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [stemArea, setStemArea] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else {
      setFirstName("");
      setEmail("");
      setStemArea("");
      setInterests([]);
      setNewsletterOptIn(true);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    if (!executeRecaptcha) {
      toast.error("Security check not ready — please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("subscribe");

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          stemArea: stemArea || null,
          interests,
          newsletterOptIn,
          recaptchaToken,
        }),
      });

      const data = (await res.json()) as { success?: boolean; alreadyMember?: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.alreadyMember) {
          toast.success("You're already part of CWS! Great to see you.");
        }
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 animate-fade-in-up">
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
            <h2 className="font-display text-2xl font-bold text-primary mb-2">
              Welcome to CWS!
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              You're in, {firstName}. We'll keep you in the loop on upcoming events,
              resources, and community updates.
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
            <div className="mb-6">
              <h2
                id="join-modal-title"
                className="font-display text-2xl font-bold text-primary mb-1"
              >
                Join CWS<span className="text-secondary">.</span>
              </h2>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                Sign up to stay connected with Colorado Women in STEM.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <input
                ref={firstInputRef}
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                disabled={isSubmitting}
                required
                maxLength={100}
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={isSubmitting}
                required
                maxLength={254}
              />

              {/* STEM Area */}
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">
                  STEM Area <span className="normal-case">(optional)</span>
                </label>
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
              </div>

              {/* Interests */}
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                  I'm interested in <span className="normal-case">(select all that apply)</span>
                </label>
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !firstName.trim() || !email.trim()}
                className="w-full bg-secondary text-secondary-foreground font-body font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Joining…
                  </>
                ) : (
                  "Join the Community"
                )}
              </button>

              {/* Newsletter opt-out */}
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
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinModal;
