"use client";

import { Page } from "@rawwee/react-pdf-html";
import { Font } from "@react-pdf/renderer";
import dayjs from "dayjs";
import React, { useCallback } from "react";

import {
  SECTION_REGISTRY,
  type SectionRendererProps,
} from "@/components/templates/section-registry";
import { type TemplateProp } from "@/components/templates/template-wrapper";
import { useTemplate04Style } from "@/hooks/use-template-04-style";

Font.registerHyphenationCallback((word) => [word]);

const Template04: React.FC<TemplateProp> = ({ templateFormat, resume }) => {
  const { styles, TableRow } = useTemplate04Style(templateFormat);

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

  // Personal always first with compact header style
  const personalRenderer = SECTION_REGISTRY["personal"];
  const otherSections = sectionOrder.filter(
    (type) => type !== "personal" && !hiddenSections.includes(type),
  );

  return (
    <Page size={"A4"} style={styles.page}>
      {/* Compact header */}
      {!hiddenSections.includes("personal") && (
        <>{personalRenderer?.(rendererProps)}</>
      )}

      {/* All other sections — compact with reduced gap */}
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

export default Template04;
