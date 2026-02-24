import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock } from "lucide-react";

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tag: string;
  signUpUrl: string;
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("/.netlify/functions/events");
  if (!res.ok) throw new Error("Failed to load events");
  const data = await res.json();
  return data.events as Event[];
}

// ---------------------------------------------------------------------------
// Skeleton card shown while loading
// ---------------------------------------------------------------------------
function EventSkeleton() {
  return (
    <div className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border border-border animate-pulse">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded-full" />
      </div>
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted rounded mb-4" />
      <div className="flex flex-wrap gap-4">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-4 w-36 bg-muted rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const EventsSection = () => {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return (
    <section id="events" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            What's Coming Up
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Future <span className="text-primary italic">Events</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading && (
            <>
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </>
          )}

          {isError && (
            <p className="text-center font-body text-muted-foreground py-8">
              Unable to load events right now. Check back soon!
            </p>
          )}

          {!isLoading && !isError && events?.length === 0 && (
            <p className="text-center font-body text-muted-foreground py-8">
              No upcoming events at this time. Stay tuned!
            </p>
          )}

          {events?.map((event) => (
            <div
              key={event.title}
              className="bg-background rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow border border-border group"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <span className="text-xs font-body font-semibold uppercase tracking-wider bg-secondary/15 text-secondary px-3 py-1 rounded-full">
                  {event.tag}
                </span>
              </div>
              <p className="font-body text-muted-foreground text-sm mb-4 leading-relaxed">
                {event.description}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-body">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" /> {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> {event.location}
                  </span>
                </div>
                {event.signUpUrl && (
                  <a
                    href={event.signUpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-secondary text-secondary-foreground font-body font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
