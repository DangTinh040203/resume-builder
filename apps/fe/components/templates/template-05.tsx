"use client";

import { Page, Text, View } from "@rawwee/react-pdf-html";
import { Font } from "@react-pdf/renderer";
import dayjs from "dayjs";
import React, { useCallback } from "react";
import { v4 as uuid } from "uuid";

import HtmlToPdf from "@/components/templates/html-to-pdf";
import {
  SECTION_REGISTRY,
  type SectionRendererProps,
} from "@/components/templates/section-registry";
import { type TemplateProp } from "@/components/templates/template-wrapper";
import { useTemplate05Style } from "@/hooks/use-template-05-style";
import { type SectionType } from "@/stores/features/template.slice";

Font.registerHyphenationCallback((word) => [word]);

type Template05Styles = ReturnType<typeof useTemplate05Style>["styles"];

// Sections that use timeline layout
const TIMELINE_SECTIONS: SectionType[] = ["experience", "education"];

const Template05: React.FC<TemplateProp> = ({ templateFormat, resume }) => {
  const { styles, TableRow } = useTemplate05Style(templateFormat);

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

  const { title, subTitle, information } = resume;

  const bodySections = sectionOrder.filter(
    (type) => type !== "personal" && !hiddenSections.includes(type),
  );

  return (
    <Page size={"A4"} style={styles.page}>
      {/* ── Bold Header Block ── */}
      {!hiddenSections.includes("personal") && (
        <View style={styles.headerBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subTitle}>{subTitle}</Text>

          <View style={styles.headerInfoRow}>
            {information.map((info) => (
              <View key={uuid()} style={styles.informationItem}>
                <Text style={styles.informationLabel}>{info.label}:</Text>
                <Text style={styles.headerInfoValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Body ── */}
      <View style={styles.body}>
        {bodySections.map((sectionType) => {
          // Use timeline layout for experience and education
          if (TIMELINE_SECTIONS.includes(sectionType)) {
            return (
              <React.Fragment key={sectionType}>
                {renderTimelineSection(sectionType, rendererProps, styles)}
              </React.Fragment>
            );
          }

          // Default registry renderer for other sections
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

// Timeline renderers for experience and education
function renderTimelineSection(
  type: SectionType,
  props: SectionRendererProps,
  styles: Template05Styles,
) {
  const { resume, formatDate } = props;

  if (type === "experience") {
    const { workExperiences } = resume;
    if (!workExperiences || workExperiences.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.separator} />
        <View style={styles.sectionContentNoGap}>
          {workExperiences.map((exp, idx) => (
            <View key={exp.id} style={styles.timelineItem} wrap={false}>
              {/* Timeline gutter */}
              <View style={styles.timelineGutter}>
                <View style={styles.timelineDot} />
                {idx < workExperiences.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              {/* Content */}
              <View style={styles.timelineContent}>
                <View
                  style={{
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text style={styles.itemTitle}>{exp.company}</Text>
                    <Text style={{ ...styles.textSm, flexShrink: 0 }}>
                      {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      opacity: 0.8,
                      fontStyle: "italic",
                      marginBottom: 2,
                    }}
                  >
                    {exp.position}
                  </Text>
                </View>
                <HtmlToPdf style={styles.text} content={exp.description} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (type === "education") {
    const { educations } = resume;
    if (!educations || educations.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.separator} />
        <View style={styles.sectionContentNoGap}>
          {educations.map((edu, idx) => (
            <View key={uuid()} style={styles.timelineItem}>
              <View style={styles.timelineGutter}>
                <View style={styles.timelineDot} />
                {idx < educations.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.itemTitle}>{edu.school}</Text>
                <Text>
                  {edu.major} — {edu.degree}
                </Text>
                <Text style={styles.textSmMuted}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

export default Template05;
