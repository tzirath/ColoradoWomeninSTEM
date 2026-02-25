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

const JoinModal = ({ open, onClose }: JoinModalProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else {
      // Reset form when closed
      setFirstName("");
      setEmail("");
      setSuccess(false);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

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
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim(), recaptchaToken }),
      });

      const data = (await res.json()) as { success?: boolean; alreadyMember?: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.alreadyMember) {
          toast.success("You're already part of Bloom! Great to see you.");
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
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md p-8 animate-fade-in-up">
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
                Sign up to stay connected — you'll receive our newsletter and
                updates about events, resources, and opportunities for women in STEM.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
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
              </div>

              <div>
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
              </div>

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

              <p className="text-center text-muted-foreground/60 font-body text-xs">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinModal;
