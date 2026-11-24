import { Lightbulb, Sprout, HandHeart, Wrench, MessageCircleHeart, type LucideIcon } from "lucide-react";

export interface Initiative {
  slug: string;
  icon: LucideIcon;
  name: string;
  /** Optional small label shown under the name on the detail page. */
  subtitle?: string;
  tagline: string;
  shortDescription: string;
  description: string;
  about: string;
  goal: string;
  whatToExpect: string;
  /** Grow Bold extras shown at the top of the detail page. */
  steps?: string[];
  feelings?: string[];
  focusTags?: string[];
  /** Extras shown after "What to expect". */
  comingSoon?: string;
  access?: string;
  /** site_content key for the optional Sign Up link (editable in admin). */
  signupKey: string;
  /** Set to true to hide this initiative from the public site (nav, footer, cards, its page). Admin still shows it. */
  hidden?: boolean;
  /** site_content key for the optional photo (uploaded in admin). */
  imageKey: string;
  /** Older site_content key, read as a fallback so existing Sign Up links keep working. */
  legacySignupKey?: string;
}

export const INITIATIVES_INTRO =
  "CWS programs are built by and for our members, designed to create real connection, develop real skills, and drive real change. Each initiative is linked to peer-reviewed research on what helps women stay and thrive in STEM.";

export const INITIATIVES: Initiative[] = [
  {
    slug: "curiosity-exchange",
    icon: Lightbulb,
    name: "Curiosity Exchange",
    tagline: "Teach what you know. Learn what you don't.",
    shortDescription:
      "Swap skills and explore STEM together through peer teaching and field trips with practicing scientists.",
    description:
      "Learning should be a lifelong goal. Learning together makes it more fun. Learning from each other creates community. Curiosity Exchange is our effort to facilitate a fun learning environment through our community of amazing knowledgeable women. The idea is to learn from them, but also step into the teacher role and share the knowledge YOU have. There is no hierarchy, we all can learn from each other.",
    about:
      "Curiosity Exchange is Colorado Women in STEM's peer-to-peer learning initiative, connecting members through skill-sharing and hands-on field experiences across STEM disciplines. It builds engagement and community through opportunities that encourage members to teach, learn, and explore, from skill swaps to field excursions with practicing scientists.",
    goal:
      "Build a knowledge-sharing community where members grow their curiosity and skills through peer teaching and hands-on STEM exploration.",
    whatToExpect:
      "Skill-swap meetups and field trips, such as geology hikes, bird walks, aquarium visits with marine biologists, and botanical garden walks with ecologists. Roughly every couple of months.",
    signupKey: "initiative_curiosity_exchange_signup_url",
    imageKey: "initiative_curiosity_exchange_image",
    legacySignupKey: "initiative_skill_swap_signup_url",
  },
  {
    slug: "grow-bold",
    icon: Sprout,
    name: "Grow Bold",
    tagline: "Connect. Build confidence. Grow bold.",
    shortDescription:
      "Networking events and workshops that help you build your personal brand, practice your story, and show up boldly in your career.",
    description:
      "Time to spread your wings. But we won't be the type of bird mom to push you off the branch saying good luck. First we will connect you to knowledge through intentional networking events and career-growth workshops. Second we will help you build your confidence by establishing your own personal brand and practicing your storytelling. And then finally, we will push you off the branch to grow bold ;)",
    about:
      "Grow Bold is Colorado Women in STEM's confidence-building initiative, helping members develop the self-efficacy to network, speak up, and advocate for themselves professionally. Confidence is a trainable skill, not a fixed trait. The initiative combines intentional networking events, career-growth workshops, personal branding, and storytelling practice to help members show up boldly in their careers.",
    goal:
      "Give members the confidence and tools to show up boldly: network, speak up, and put themselves forward professionally.",
    whatToExpect:
      "LinkedIn workshops, intentional networking events, public speaking workshops, storytelling and elevator pitch workshops, and personal branding workshops. Roughly every couple of months.",
    steps: ["Connect", "Build confidence", "Grow bold"],
    feelings: ["Confidence", "Fearlessness", "Possibility", "Self-efficacy"],
    focusTags: ["Confidence-building", "Knowledge-sharing", "Networking"],
    comingSoon:
      "Our member networking directory, searchable by STEM category, interests, and career stage.",
    signupKey: "initiative_grow_bold_signup_url",
    imageKey: "initiative_grow_bold_image",
    legacySignupKey: "initiative_members_network_signup_url",
  },
  {
    slug: "champions-circle",
    icon: HandHeart,
    name: "Champions Circle",
    subtitle: "Mentorship + Sponsorship",
    hidden: true, // Not public yet. Delete this line to show Champions Circle again.
    tagline: "Someone to guide you. Someone to speak up for you.",
    shortDescription:
      "Mentors who guide and sponsors who advocate, at every career stage. As you grow, you help the next woman up.",
    description:
      "You can climb the mountain all by yourself. Or be open to the idea that a helping hand brings you equally to the top of the mountain. The era of patriarchal competition is over, the future is here and is showing up as women lifting each other up higher and higher. Champions Circle is the rope that connects YOU with the helping hand to get you to the top.",
    about:
      "Champions Circle is Colorado Women in STEM's mentorship and sponsorship initiative, pairing members with mentors who guide and sponsors who advocate for them at every career stage. Membership is reciprocal by design. As members grow, they are equipped to become mentors and sponsors themselves, extending the circle to the next woman coming up. It offers what has long existed in professional networks, now built by and for us.",
    goal:
      "Give every member both guidance (mentorship) and advocacy (sponsorship): being seen, championed, and put forward by others, at every career stage.",
    whatToExpect:
      "Mentor matching, speed networking, and executive-level workshops. A few times a year.",
    access:
      "Centered communities (Black, Indigenous, Asian, Pacific Islander, and Latina women in STEM) first, others welcome.",
    signupKey: "initiative_champions_circle_signup_url",
    imageKey: "initiative_champions_circle_image",
    legacySignupKey: "initiative_mentorship_signup_url",
  },
  {
    slug: "stem-in-action",
    icon: Wrench,
    name: "STEM in Action",
    tagline: "Apply your skills to real community needs.",
    shortDescription:
      "Partner with community organizations to identify needs and apply members' technical skills towards solutions they help define.",
    description:
      "STEM has a huge entry-barrier. But in a time and age where we have access to all the knowledge, all the tools and all the communities, there are no more excuses to sit on your glutes. STEM in Action is the bulldozer. We are taking things into our own hands and connecting YOUR knowledge and skills with actual community needs. You want to make a better world? As easy as signing up to this initiative.",
    about:
      "Partner with community organizations to identify needs and apply members' technical skills towards solutions they help define.",
    goal:
      "Turn members' STEM skills into visible, active community impact: presence and advocacy through service, not just talk.",
    whatToExpect:
      "Community service partnerships, volunteer projects with local organizations, and design sprints or solution days. Roughly every couple of months.",
    signupKey: "initiative_stem_in_action_signup_url",
    imageKey: "initiative_stem_in_action_image",
  },
  {
    slug: "real-talk",
    icon: MessageCircleHeart,
    name: "CWS Real Talk",
    tagline: "Honest talk. Real support.",
    shortDescription:
      "A safe, sisterhood-driven space to talk through burnout, work-life balance, and workplace challenges, and walk away with relief and hope.",
    description:
      "Uncomfortable conversations are needed and celebrated at CWS. But this is not a trauma-dumping space nor the poor-me-show. We want you to walk away from these talks with relief, freedom and hope. This is a space to share your hardships in a contained environment, this means being held by your community and guided by professionals that care about your wellbeing. Talk is cheap if you don't walk it. Or something like that. Here our talk is real.",
    about:
      "A safe, sisterhood-driven space where members support each other through the real challenges of being a woman in STEM, with resources and peer support to navigate workplace challenges, burnout, and work-life balance.",
    goal:
      "Create a safe, sisterhood-driven space where members support each other through the real challenges of being a woman in STEM, including burnout and work-life balance.",
    whatToExpect:
      "Safe circles, peer support sessions, community discussions on workplace and ethical challenges, and wellbeing events focused on managing burnout and encouraging work-life balance. Roughly every couple of months.",
    signupKey: "initiative_real_talk_signup_url",
    imageKey: "initiative_real_talk_image",
    legacySignupKey: "initiative_cws_voices_signup_url",
  },
];

export const INITIATIVE_SLUGS = INITIATIVES.map((i) => i.slug);

/** Initiatives shown on the public site. */
export const VISIBLE_INITIATIVES = INITIATIVES.filter((i) => !i.hidden);

/** Looks up a public initiative; hidden ones return undefined so their page 404s. */
export function getInitiative(slug: string): Initiative | undefined {
  return VISIBLE_INITIATIVES.find((i) => i.slug === slug);
}

/** Old URL slugs mapped to their new slugs (used for redirects and merging old analytics). */
export const LEGACY_INITIATIVE_SLUGS: Record<string, string> = {
  "skill-swap": "curiosity-exchange",
  "members-network": "grow-bold",
  mentorship: "champions-circle",
  "cws-voices": "real-talk",
};
