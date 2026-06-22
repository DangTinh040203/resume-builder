'use client';
import { Card, CardContent } from '@resume-builder/ui/components/card';
import { cn } from '@resume-builder/ui/lib/utils';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ChevronRight,
  Code,
  FileText,
  FolderGit2,
  GraduationCap,
  Plus,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

export enum Section {
  Personal = 'personal',
  Summary = 'summary',
  Skills = 'skills',
  Education = 'education',
  Experience = 'experience',
  Projects = 'projects',
  Extra = 'extra',
}

const sectionConfig = [
  { id: Section.Personal, labelKey: 'sections.personal', icon: User },
  { id: Section.Summary, labelKey: 'sections.summary', icon: FileText },
  { id: Section.Skills, labelKey: 'sections.skills', icon: Code },
  {
    id: Section.Education,
    labelKey: 'sections.education',
    icon: GraduationCap,
  },
  { id: Section.Experience, labelKey: 'sections.experience', icon: Briefcase },
  { id: Section.Projects, labelKey: 'sections.projects', icon: FolderGit2 },
  { id: Section.Extra, labelKey: 'sections.extra', icon: Plus },
];

interface ResumeBuilderSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const ResumeBuilderSidebar = ({
  activeSection,
  onSectionChange,
}: ResumeBuilderSidebarProps) => {
  const t = useTranslations('Builder');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        order-1 h-full w-full
        lg:col-span-2
      `}
    >
      {/* Responsive navigation: Horizontal on mobile, Vertical on desktop */}
      <Card
        className={`
          bg-card/80 border-border/50 sticky top-0 z-20 py-0 backdrop-blur-sm
          lg:top-4
        `}
      >
        <CardContent className='p-2'>
          <nav
            className={`
              scrollbar-hide flex scrollbar-none space-x-2 overflow-x-auto
              lg:flex-col lg:space-y-1 lg:space-x-0
            `}
          >
            {sectionConfig.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  `
                    flex h-10 w-auto shrink-0 cursor-pointer items-center
                    justify-between rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    lg:w-full
                  `,
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-primary/25 shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className='flex items-center gap-2'>
                  <section.icon className='h-4 w-4' />
                  <span className='whitespace-nowrap'>
                    {t(section.labelKey)}
                  </span>
                </span>
                {activeSection === section.id && (
                  <ChevronRight className={`
                    hidden h-4 w-4
                    lg:block
                  `} />
                )}
              </motion.button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResumeBuilderSidebar;
