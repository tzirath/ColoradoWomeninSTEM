import ContactSection from "@/components/ContactSection";

export const metadata = {
  title: "Contact | CWS",
  description: "Get in touch with Colorado Women in STEM.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <ContactSection />
    </div>
  );
}
