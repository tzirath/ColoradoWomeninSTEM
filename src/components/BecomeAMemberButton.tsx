"use client";

import { useJoinModal } from "@/components/JoinModalContext";
import { trackSignupClick } from "@/components/InitiativeTracker";

export default function BecomeAMemberButton({ slug }: { slug?: string }) {
  const { openModal } = useJoinModal();
  return (
    <button onClick={() => { if (slug) trackSignupClick(slug); openModal(); }}
      className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity">
      Subscribe to Newsletter
    </button>
  );
}
