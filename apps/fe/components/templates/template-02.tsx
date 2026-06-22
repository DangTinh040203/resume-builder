"use client";

import { Page, View } from "@rawwee/react-pdf-html";
import { Font } from "@react-pdf/renderer";
import dayjs from "dayjs";
import React, { useCallback } from "react";

import {
  SECTION_REGISTRY,
  type SectionRendererProps,
} from "@/components/templates/section-registry";
import { type TemplateProp } from "@/components/templates/template-wrapper";
import { useTemplate02Style } from "@/hooks/use-template-02-style";

Font.registerHyphenationCallback((word) => [word]);

const Template02: React.FC<TemplateProp> = ({ templateFormat, resume }) => {
  const { styles, TableRow } = useTemplate02Style(templateFormat);

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

  // Split: personal always first, rest dynamic
  const personalRenderer = SECTION_REGISTRY["personal"];
  const otherSections = sectionOrder.filter(
    (type) => type !== "personal" && !hiddenSections.includes(type),
  );

  return (
    <Page size={"A4"} style={styles.page}>
      {/* Personal header — always first, with bottom accent line */}
      {!hiddenSections.includes("personal") && (
        <>
          {personalRenderer?.(rendererProps)}
          <View
            style={{
              height: 1.5,
              width: "100%",
              backgroundColor: templateFormat.color,
              opacity: 0.3,
            }}
          />
        </>
      )}

      {/* Remaining sections — dynamic order */}
      {otherSections.map((sectionType) => {
        const renderer = SECTION_REGISTRY[sectionType];
        return (
          <React.Fragment key={sectionType}>
            {renderer?.(rendererProps)}
          </React.Fragment>
        );
      })}
    </Page>
  );
};

export default Template02;
