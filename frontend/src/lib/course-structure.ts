import { type CefrLevel } from "@/lib/lesson-data";

export type CefrModule = {
  title: string;
  outcomes: string[];
};

export type CefrLevelStructure = {
  level: CefrLevel;
  summary: string;
  status?: "ready" | "planned";
  modules: CefrModule[];
};

export const cefrCourseStructure: CefrLevelStructure[] = [
  {
    level: "A1",
    summary:
      "A1 is the core starter track: introductions, age, origin, routines, places, shopping, and guided first communication from zero.",
    status: "ready",
    modules: [
      {
        title: "Personal Basics",
        outcomes: [
          "Introduce yourself and other people",
          "Share simple personal information",
          "Use very common present tense patterns",
        ],
      },
      {
        title: "First Survival Situations",
        outcomes: [
          "Ask for prices, places, and directions",
          "Handle simple shop and cafe exchanges",
          "Recognize key public place vocabulary",
        ],
      },
      {
        title: "Travel and Movement",
        outcomes: [
          "Use ticket, time, and transport language",
          "Follow short route instructions",
          "Reinforce A1 grammar foundations",
        ],
      },
    ],
  },
  {
    level: "A2",
    summary:
      "A2 expands independence: past events, plans, services, comparisons, and everyday problem solving.",
    status: "ready",
    modules: [
      {
        title: "Everyday Independence",
        outcomes: [
          "Describe home, neighborhood, and habits",
          "Talk about recent past events",
          "Connect practical daily details clearly",
        ],
      },
      {
        title: "Planning and Coordination",
        outcomes: [
          "Discuss future plans and arrangements",
          "Manage repeated work or service dialogues",
          "Use more flexible connectors and requests",
        ],
      },
      {
        title: "Service and Recovery",
        outcomes: [
          "Report simple issues and ask for help",
          "Describe people and places in more detail",
          "Consolidate key A2 structures",
        ],
      },
    ],
  },
  {
    level: "B1",
    summary:
      "B1 develops independent communication: opinions, connected travel stories, work interaction, and longer everyday exchanges.",
    status: "ready",
    modules: [
      {
        title: "Opinions and Narratives",
        outcomes: [
          "Share reasons, preferences, and reactions",
          "Tell connected stories about past experiences",
          "Describe media and events in more detail",
        ],
      },
      {
        title: "Work and Social Interaction",
        outcomes: [
          "Handle meetings and professional updates",
          "Manage travel and social coordination",
          "Use more natural connectors and sequencing",
        ],
      },
      {
        title: "Fluency Building",
        outcomes: [
          "Sustain longer speaking turns",
          "Repair misunderstandings more independently",
          "Consolidate the path toward confident independent communication",
        ],
      },
    ],
  },
];
