import { type Resume } from "@/types/resume.type";

export const MOCK_RESUME: Resume = {
  id: "resume-1",
  userId: "user-1",
  title: "Full Name",
  subTitle: "Software Engineer",
  overview:
    "Passionate software engineer with 5+ years of experience in building scalable web applications. Expert in React, Node.js, and cloud technologies. Proven track record of delivering high-quality code and leading development teams.",
  avatar: "https://github.com/shadcn.png",
  information: [
    {
      id: "info-1",
      label: "Email",
      value: "hello@example.com",
      resumeId: "resume-1",
    },
    {
      id: "info-2",
      label: "Phone",
      value: "+1 (555) 123-4567",
      resumeId: "resume-1",
    },
    {
      id: "info-3",
      label: "Location",
      value: "San Francisco, CA",
      resumeId: "resume-1",
    },
    {
      id: "info-4",
      label: "Website",
      value: "www.example.com",
      resumeId: "resume-1",
    },
  ],
  educations: [
    {
      id: "edu-1",
      school: "Stanford University",
      degree: "Master of Science",
      major: "Computer Science",
      startDate: "2018-09-01T00:00:00.000Z",
      endDate: "2020-06-15T00:00:00.000Z",
      resumeId: "resume-1",
    },
    {
      id: "edu-2",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      major: "Electrical Engineering",
      startDate: "2014-09-01T00:00:00.000Z",
      endDate: "2018-05-30T00:00:00.000Z",
      resumeId: "resume-1",
    },
  ],
  skills: [
    {
      id: "skill-1",
      label: "Frontend",
      value: "React, Next.js, TypeScript, Tailwind CSS",
      resumeId: "resume-1",
    },
    {
      id: "skill-2",
      label: "Backend",
      value: "Node.js, NestJS, PostgreSQL, Redis",
      resumeId: "resume-1",
    },
    {
      id: "skill-3",
      label: "DevOps",
      value: "Docker, Kubernetes, AWS, CI/CD",
      resumeId: "resume-1",
    },
    {
      id: "skill-4",
      label: "Tools",
      value: "Git, Jira, Figma, VS Code",
      resumeId: "resume-1",
    },
  ],
  workExperiences: [
    {
      id: "exp-1",
      company: "Tech Giant Corp",
      position: "Senior Software Engineer",
      description:
        "Leading the frontend architecture for the main dashboard. Improved load time by 40% and implemented a new design system used across 5 different products. Mentoring junior developers and conducting code reviews.",
      startDate: "2022-01-01T00:00:00.000Z",
      endDate: null,
      resumeId: "resume-1",
    },
    {
      id: "exp-2",
      company: "StartUp Inc",
      position: "Full Stack Developer",
      description:
        "Built the MVP from scratch using MERN stack. Integrated payment gateways, real-time chat, and notification system. Scaled the application to support 10k+ concurrent users.",
      startDate: "2020-07-01T00:00:00.000Z",
      endDate: "2021-12-31T00:00:00.000Z",
      resumeId: "resume-1",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Project Alpha",
      subTitle: "Open Source Contribution",
      details:
        "Contributed to a major open source React UI library. Added 5 new components and fixed critical accessibility bugs.",
      technologies: "React, TypeScript, Jest",
      position: "Contributor",
      responsibilities:
        "- Implemented new accessible components\n- Wrote unit tests for all new features",
      domain: "Open Source / UI Library",
      demo: "https://github.com/shadcn/ui",
      resumeId: "resume-1",
    },
    {
      id: "proj-2",
      title: "Task Master App",
      subTitle: "Personal Project",
      details:
        "A productivity application built with Flutter and Firebase. Features include task organization, time tracking, and team collaboration.",
      technologies: "Flutter, Firebase, Dart",
      position: "Solo Developer",
      responsibilities:
        "- Designed and implemented the entire application\n- Integrated Firebase Auth and Firestore",
      domain: "Productivity",
      demo: "https://taskmaster.app",
      resumeId: "resume-1",
    },
  ],
  certifications: [],
  languages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
