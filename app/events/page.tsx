import EventsSection from "@/components/EventsSection";

export const metadata = {
  title: "Events | CWS",
  description: "Upcoming events from Colorado Women of Color in STEM.",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <EventsSection />
    </div>
  );
}
