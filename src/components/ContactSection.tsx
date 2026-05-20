"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import { Mail, MapPin, Instagram, Linkedin, Loader2 } from "lucide-react";
import FlowerDecor, { PEACH } from "@/components/FlowerDecor";

const INQUIRY_TYPES = [
  "General",
  "Volunteer",
  "Sponsorship",
  "Partnership",
  "Media / Press",
] as const;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  inquiryType: z.enum(INQUIRY_TYPES, {
    errorMap: () => ({ message: "Please select an inquiry type" }),
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-bloom-sage/30 text-primary-foreground placeholder:text-bloom-sage/60 font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50";

const selectClass =
  "w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-bloom-sage/30 text-primary-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 appearance-none cursor-pointer";

const ContactSection = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    if (!executeRecaptcha) {
      toast.error("Security check not ready — please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("contact_form");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      let result: { error?: string } = {};
      try {
        result = (await res.json()) as { error?: string };
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        reset();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-primary relative overflow-hidden">
      <FlowerDecor flowers={[
        { src: 1, position: "-left-10 -bottom-4",  size: 195, opacity: 0.45, anim: "cw",    dur: 29, mx: 18, my: 10, td: 460, filter: PEACH },
        { src: 3, position: "-left-4  top-4",      size: 125, opacity: 0.35, anim: "ccw",   dur: 35, mx: -12, my: -7, td: 540, filter: PEACH },
        { src: 2, position: "-right-8 top-1/3",    size: 165, opacity: 0.4,  anim: "drift", dur: 21, mx: 22, my: 13, td: 400, filter: PEACH },
      ]} />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <p className="font-body text-bloom-sage text-sm uppercase tracking-[0.2em] mb-3">
            Let's Connect
          </p>
          <h2 className="font-body text-4xl md:text-5xl font-bold text-primary-foreground">
            Get in <span className="font-display italic text-secondary">Touch</span>
          </h2>
          <p className="font-body text-bloom-sage max-w-xl mx-auto mt-4 leading-relaxed">
            Whether you want to join, volunteer, sponsor, or simply learn more —
            we'd love to hear from you.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className={inputClass}
                  disabled={isSubmitting}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-bloom-coral-light font-body">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className={inputClass}
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-bloom-coral-light font-body">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <select
                className={selectClass}
                disabled={isSubmitting}
                defaultValue=""
                {...register("inquiryType")}
              >
                <option value="" disabled className="bg-primary text-bloom-sage/60">
                  Select Inquiry Type
                </option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-primary text-primary-foreground">
                    {type}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-bloom-sage/60">
                ▾
              </span>
              {errors.inquiryType && (
                <p className="mt-1 text-xs text-bloom-coral-light font-body">
                  {errors.inquiryType.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                rows={4}
                placeholder="Your Message"
                className={`${inputClass} resize-none`}
                disabled={isSubmitting}
                {...register("message")}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-bloom-coral-light font-body">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary text-secondary-foreground font-body font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Message"
              )}
            </button>

            <p className="text-center text-bloom-sage/50 font-body text-xs">
              Protected by reCAPTCHA —{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-bloom-sage transition-colors">
                Privacy
              </a>{" "}
              &{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-bloom-sage transition-colors">
                Terms
              </a>
            </p>
          </form>

          <div className="mt-12 flex flex-col items-center gap-4 text-bloom-sage font-body text-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-secondary" />
              <span>coloradowomeninstem@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-secondary" />
              <span>Colorado</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://www.instagram.com/coloradowomeninstem/" target="_blank" rel="noopener noreferrer" className="text-bloom-sage hover:text-secondary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/groups/18686021/" target="_blank" rel="noopener noreferrer" className="text-bloom-sage hover:text-secondary transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default ContactSection;
