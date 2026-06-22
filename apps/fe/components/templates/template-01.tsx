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
import { useTemplateStyle } from "@/hooks/use-template-style";

Font.registerHyphenationCallback((word) => [word]);

const Template01: React.FC<TemplateProp> = ({ templateFormat, resume }) => {
  const { styles, TableRow } = useTemplateStyle(templateFormat);

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

  return (
    <Page size={"A4"} style={styles.page}>
      {sectionOrder
        .filter((type) => !hiddenSections.includes(type))
        .map((sectionType) => {
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

export default Template01;
