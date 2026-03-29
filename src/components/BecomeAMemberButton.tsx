"use client";

import { useJoinModal } from "@/components/JoinModalContext";

export default function BecomeAMemberButton() {
  const { openModal } = useJoinModal();
  return (
    <button onClick={openModal}
      className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity">
      Become a Member
    </button>
  );
}
