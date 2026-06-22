import { Text, View } from "@rawwee/react-pdf-html";
import { StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

import { templateGlobalStyles } from "@/configs/template-style.config";
import { type Format } from "@/stores/features/template.slice";

export const useTemplateStyle = (templateFormat: Format) => {
  const styles = useMemo(() => {
    const theme = {
      color: templateFormat.color,
      fontSize: templateFormat.fontSize,
      fontFamily: templateFormat.fontFamily,
      titleSize: templateFormat.titleSize,
      sectionTitleSize: templateFormat.sectionTitleSize,
      subTitleSize: templateFormat.subTitleSize,
      lineHeight: templateFormat.lineHeight,
      letterSpacing: templateFormat.letterSpacing,
      fontWeight: templateFormat.fontWeight,
      sectionSpacing: templateFormat.sectionSpacing,
      margin: templateFormat.margin,
      pageFormat: templateFormat.pageFormat,
    };

    // Map fontWeight string to numeric value for react-pdf
    const fontWeightMap: Record<string, number> = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };
    const fontWeightValue = fontWeightMap[theme.fontWeight] || 400;

    return StyleSheet.create({
      page: {
        ...templateGlobalStyles.page,
        padding: theme.margin,
        flexDirection: "column",
        rowGap: theme.sectionSpacing,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        fontWeight: fontWeightValue,
        fontFamily: theme.fontFamily,
      },

      section: {
        flexDirection: "column",
        width: "100%",
        gap: 2,
      },

      sectionContent: {
        flexDirection: "column",
        gap: 10,
        marginTop: 6,
      },

      separator: {
        height: 1,
        width: "100%",
        backgroundColor: "gray",
      },

      text: {
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
      },

      textSm: {
        fontSize: theme.fontSize - 2,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
      },

      textXs: {
        fontSize: theme.fontSize - 4,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
      },

      title: {
        fontSize: theme.titleSize,
        ...templateGlobalStyles.fontWeight600,
        color: theme.color,
        lineHeight: 1.1,
      },

      subTitle: {
        ...templateGlobalStyles.heading2,
        fontSize: theme.subTitleSize,
        ...templateGlobalStyles.fontWeight600,
        lineHeight: 1.2,
      },

      sectionTitle: {
        ...templateGlobalStyles.heading3,
        fontSize: theme.sectionTitleSize,
        ...templateGlobalStyles.fontWeight600,
        color: theme.color,
      },

      label: {
        ...templateGlobalStyles.fontWeight600,
        minWidth: 70,
      },

      itemTitle: {
        ...templateGlobalStyles.fontWeight600,
        minWidth: 70,
        fontSize: theme.fontSize + 0.5,
      },

      informationGroup: {
        ...templateGlobalStyles.gapXl,
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
      },

      informationItem: {
        flexDirection: "row",
        fontStyle: "normal",
      },

      informationLabel: {
        ...templateGlobalStyles.fontWeight600,
        minWidth: 70,
      },

      row: {
        flexDirection: "row",
        gap: 10,
      },

      rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
      },

      col: {
        display: "flex",
        flexDirection: "column",
      },

      // Project table styles
      projectTable: {
        border: "0.5px solid #ccc",
        flexDirection: "column",
        gap: 0,
      },

      projectTableRow: {
        flexDirection: "row",
        borderTop: "0.5px solid #ccc",
      },

      projectTableFirstRow: {
        flexDirection: "row",
      },

      projectTableLabelCell: {
        borderRight: "0.5px solid #ccc",
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 120,
      },

      projectTableValueCell: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
      },
    });
  }, [templateFormat]);

  // TableRow component for project details
  const TableRow = ({
    label,
    children,
    isFirst = false,
  }: {
    label: string;
    children: React.ReactNode;
    isFirst?: boolean;
  }) => (
    <View
      style={isFirst ? styles.projectTableFirstRow : styles.projectTableRow}
    >
      <View style={styles.projectTableLabelCell}>
        <Text>{label}</Text>
      </View>
      <View style={styles.projectTableValueCell}>{children}</View>
    </View>
  );

  return { styles, TableRow };
};
