"use client";

import { Page, Text, View } from "@rawwee/react-pdf-html";
import { Font } from "@react-pdf/renderer";
import dayjs from "dayjs";
import React, { useCallback } from "react";
import { v4 as uuid } from "uuid";

import {
  SECTION_REGISTRY,
  type SectionRendererProps,
} from "@/components/templates/section-registry";
import { type TemplateProp } from "@/components/templates/template-wrapper";
import { useTemplate03Style } from "@/hooks/use-template-03-style";
import { type SectionType } from "@/stores/features/template.slice";

Font.registerHyphenationCallback((word) => [word]);

type Template03Styles = ReturnType<typeof useTemplate03Style>["styles"];

// Sections shown in the sidebar
const SIDEBAR_SECTIONS: SectionType[] = [
  "skills",
  "languages",
  "certifications",
  "education",
];

const Template03: React.FC<TemplateProp> = ({ templateFormat, resume }) => {
  const { styles, TableRow } = useTemplate03Style(templateFormat);

  const formatDate = useCallback(
    (date: Date | string | null | undefined) => {
      if (!date) return "Present";
      return dayjs(date).format(templateFormat.dateFormat);
    },
    [templateFormat.dateFormat],
  );

  const sectionOrder = templateFormat.sectionOrder || [];
  const hiddenSections = templateFormat.hiddenSections || [];

  const rendererProps: SectionRendererProps = {
    resume,
    styles,
    TableRow,
    formatDate,
    format: templateFormat,
  };

  // Split sections into sidebar and main
  const sidebarSections = sectionOrder.filter(
    (type) =>
      SIDEBAR_SECTIONS.includes(type) &&
      type !== "personal" &&
      !hiddenSections.includes(type),
  );

  const mainSections = sectionOrder.filter(
    (type) =>
      !SIDEBAR_SECTIONS.includes(type) &&
      type !== "personal" &&
      !hiddenSections.includes(type),
  );

  const { title, subTitle, information } = resume;

  return (
    <Page size={"A4"} style={styles.page}>
      {/* ── Sidebar ── */}
      <View style={styles.sidebar}>
        {/* Personal info in sidebar */}
        {!hiddenSections.includes("personal") && (
          <View style={styles.sidebarSection}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subTitle}>{subTitle}</Text>

            <View style={styles.sidebarSeparator} />

            <View style={styles.informationGroup}>
              {information.map((info) => (
                <View key={uuid()} style={styles.informationItem}>
                  <Text style={styles.informationLabel}>{info.label}</Text>
                  <Text style={styles.sidebarText}>{info.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sidebar sections */}
        {sidebarSections.map((sectionType) => (
          <View key={sectionType} style={styles.sidebarSection}>
            {renderSidebarSection(sectionType, rendererProps, styles)}
          </View>
        ))}
      </View>

      {/* ── Main Content ── */}
      <View style={styles.main}>
        {mainSections.map((sectionType) => {
          const renderer = SECTION_REGISTRY[sectionType];
          return (
            <React.Fragment key={sectionType}>
              {renderer?.(rendererProps)}
            </React.Fragment>
          );
        })}
      </View>
    </Page>
  );
};

// Custom sidebar renderers with white text
function renderSidebarSection(
  type: SectionType,
  props: SectionRendererProps,
  styles: Template03Styles,
) {
  const { resume, formatDate } = props;

  switch (type) {
    case "skills": {
      const { skills } = resume;
      if (!skills || skills.length === 0) return null;
      return (
        <>
          <Text style={styles.sidebarSectionTitle}>Skills</Text>
          <View style={styles.sidebarSeparator} />
          {skills.map((skill) => (
            <View key={uuid()} style={styles.sidebarItemStack}>
              <Text style={styles.sidebarTextBold}>{skill.label}</Text>
              <Text style={styles.sidebarTextLight}>{skill.value}</Text>
            </View>
          ))}
        </>
      );
    }

    case "languages": {
      const { languages } = resume;
      if (!languages || languages.length === 0) return null;
      return (
        <>
          <Text style={styles.sidebarSectionTitle}>Languages</Text>
          <View style={styles.sidebarSeparator} />
          {languages.map((lang) => (
            <View key={lang.id} style={styles.sidebarItemStackWithGap}>
              <Text style={styles.sidebarTextBold}>{lang.name}</Text>
              <Text style={styles.sidebarTextLighter}>
                — {lang.description}
              </Text>
            </View>
          ))}
        </>
      );
    }

    case "certifications": {
      const { certifications } = resume;
      if (!certifications || certifications.length === 0) return null;
      return (
        <>
          <Text style={styles.sidebarSectionTitle}>Certifications</Text>
          <View style={styles.sidebarSeparator} />
          {certifications.map((cert) => (
            <View key={cert.id} style={styles.sidebarItemCompact}>
              <Text style={styles.sidebarTextBold}>{cert.name}</Text>
              <Text style={styles.sidebarTextSmMuted75}>
                {cert.issuer} — {formatDate(cert.date)}
              </Text>
            </View>
          ))}
        </>
      );
    }

    case "education": {
      const { educations } = resume;
      if (!educations || educations.length === 0) return null;
      return (
        <>
          <Text style={styles.sidebarSectionTitle}>Education</Text>
          <View style={styles.sidebarSeparator} />
          {educations.map((edu) => (
            <View key={uuid()} style={styles.sidebarItemStackLg}>
              <Text style={styles.sidebarTextBold}>{edu.school}</Text>
              <Text style={styles.sidebarTextLight}>
                {edu.major} — {edu.degree}
              </Text>
              <Text style={styles.sidebarTextSmMuted}>
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </Text>
            </View>
          ))}
        </>
      );
    }

    default:
      return null;
  }
}

export default Template03;
