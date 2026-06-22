"use client";

import { Text, View } from "@rawwee/react-pdf-html";
import React from "react";
import { v4 as uuid } from "uuid";

import HtmlToPdf from "@/components/templates/html-to-pdf";
import {
  type Format,
  type SectionType,
} from "@/stores/features/template.slice";
import { type Resume } from "@/types/resume.type";

export interface SectionRendererProps {
  resume: Resume;
  styles: Record<string, any>;
  TableRow: React.FC<{
    label: string;
    children: React.ReactNode;
    isFirst?: boolean;
  }>;
  formatDate: (date: Date | string | null | undefined) => string;
  format: Format;
}

type SectionRenderer = (props: SectionRendererProps) => React.ReactNode | null;

function renderPersonalSection({
  resume,
  styles,
}: SectionRendererProps): React.ReactNode {
  const { title, subTitle, information } = resume;

  const informationGroup = {
    left: information.filter((_, i) => i % 2 === 0),
    right: information.filter((_, i) => i % 2 === 1),
  };

  return (
    <React.Fragment key="personal">
      {/* HEADER */}
      <View style={{ ...styles.col, gap: 4 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{subTitle}</Text>
      </View>

      {/* INFO */}
      <View style={styles.section}>
        <View style={styles.informationGroup}>
          {[informationGroup.left, informationGroup.right].map((col, i) => (
            <View key={i} style={styles.col} wrap={false}>
              {col.map((info) => (
                <View key={uuid()} style={styles.informationItem}>
                  <Text style={styles.informationLabel}>{info.label}</Text>
                  <Text> </Text>
                  <Text>{info.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </React.Fragment>
  );
}

function renderSummarySection({
  resume,
  styles,
}: SectionRendererProps): React.ReactNode | null {
  const { overview } = resume;
  if (!overview) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.separator} />
      <View style={styles.sectionContent}>
        <HtmlToPdf style={styles.text} content={overview} />
      </View>
    </View>
  );
}

function renderSkillsSection({
  resume,
  styles,
}: SectionRendererProps): React.ReactNode | null {
  const { skills } = resume;
  if (!skills || skills.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.separator} />
      <View style={{ ...styles.sectionContent, gap: 2 }}>
        {skills.map((skill) => (
          <View key={uuid()} style={styles.row}>
            <Text>{skill.label}</Text>
            <Text>{skill.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderEducationSection({
  resume,
  styles,
  formatDate,
}: SectionRendererProps): React.ReactNode | null {
  const { educations } = resume;
  if (!educations || educations.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      <View style={styles.separator} />
      <View style={styles.sectionContent}>
        {educations.map((edu) => (
          <View key={uuid()} style={{ ...styles.row, marginBottom: 4 }}>
            <View style={{ minWidth: 120 }}>
              <Text>
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.itemTitle}>{edu.school}</Text>
              <Text>
                {edu.major} - {edu.degree}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderCertificationsSection({
  resume,
  styles,
  formatDate,
}: SectionRendererProps): React.ReactNode | null {
  const { certifications } = resume;
  if (!certifications || certifications.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={styles.separator} />
      <View style={{ ...styles.sectionContent, gap: 2 }}>
        {certifications.map((cert) => (
          <View key={cert.id} style={styles.row}>
            <Text style={{ fontWeight: "bold" }}>{cert.name}</Text>
            <Text>
              {cert.issuer} - {formatDate(cert.date)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderLanguagesSection({
  resume,
  styles,
}: SectionRendererProps): React.ReactNode | null {
  const { languages } = resume;
  if (!languages || languages.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Languages</Text>
      <View style={styles.separator} />
      <View style={{ ...styles.sectionContent, gap: 2 }}>
        {languages.map((lang) => (
          <View key={lang.id} style={styles.row}>
            <Text style={{ fontWeight: "bold" }}>{lang.name}</Text>
            <Text>{lang.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderExperienceSection({
  resume,
  styles,
  formatDate,
}: SectionRendererProps): React.ReactNode | null {
  const { workExperiences } = resume;
  if (!workExperiences || workExperiences.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      <View style={styles.separator} />
      <View style={styles.sectionContent}>
        {workExperiences.map((exp) => (
          <View key={exp.id} style={styles.col} wrap={false}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "center",
              }}
            >
              <Text style={styles.itemTitle}>{exp.company}</Text>
              <Text style={{ ...styles.textSm, fontWeight: "semibold" }}>
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </Text>
            </View>
            <Text style={{ opacity: 0.8, fontStyle: "italic" }}>
              {exp.position}
            </Text>
            <View>
              <HtmlToPdf style={styles.text} content={exp.description} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderProjectsSection({
  resume,
  styles,
  TableRow,
}: SectionRendererProps): React.ReactNode | null {
  const { projects } = resume;
  if (!projects || projects.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      <View style={styles.separator} />
      <View style={{ ...styles.sectionContent, gap: 25 }}>
        {projects.map((project) => (
          <View key={uuid()} style={styles.col}>
            <View style={styles.col}>
              <Text style={styles.itemTitle}>{project.title}</Text>
              <Text style={{ opacity: 0.8, fontStyle: "italic" }}>
                {project.subTitle}
              </Text>
            </View>

            <View style={styles.projectTable}>
              <TableRow label="Descriptions" isFirst>
                <HtmlToPdf style={styles.text} content={project.details} />
              </TableRow>

              <TableRow label="Responsibilities">
                <HtmlToPdf
                  style={styles.text}
                  content={project.responsibilities}
                />
              </TableRow>

              <TableRow label="Technologies">
                <Text>{project.technologies}</Text>
              </TableRow>

              <TableRow label="Position">
                <Text>{project.position}</Text>
              </TableRow>

              <TableRow label="Domain">
                <Text>{project.domain}</Text>
              </TableRow>

              {project.demo && (
                <TableRow label="Demo">
                  <Text>{project.demo}</Text>
                </TableRow>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Registry Map
// ──────────────────────────────────────────────

export const SECTION_REGISTRY: Record<SectionType, SectionRenderer> = {
  personal: renderPersonalSection,
  summary: renderSummarySection,
  skills: renderSkillsSection,
  education: renderEducationSection,
  certifications: renderCertificationsSection,
  languages: renderLanguagesSection,
  experience: renderExperienceSection,
  projects: renderProjectsSection,
};
