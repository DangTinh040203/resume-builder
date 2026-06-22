import { Text, View } from "@rawwee/react-pdf-html";
import { StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

import { type Format } from "@/stores/features/template.slice";

export const useTemplate05Style = (templateFormat: Format) => {
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
    };

    const fontWeightMap: Record<string, number> = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };
    const fontWeightValue = fontWeightMap[theme.fontWeight] || 400;

    return StyleSheet.create({
      page: {
        flexDirection: "column",
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        fontWeight: fontWeightValue,
        fontFamily: theme.fontFamily,
        backgroundColor: "#ffffff",
      },

      // ── Bold header with accent background ──
      headerBlock: {
        backgroundColor: theme.color,
        padding: theme.margin + 5,
        paddingBottom: theme.margin,
        flexDirection: "column",
        gap: 8,
      },

      headerInfoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 2,
        columnGap: 14,
        marginTop: 4,
      },

      // ── Body content below header ──
      body: {
        padding: theme.margin,
        paddingTop: theme.margin - 4,
        flexDirection: "column",
        gap: theme.sectionSpacing + 2,
      },

      section: {
        flexDirection: "column",
        width: "100%",
        gap: 3,
      },

      sectionContent: {
        flexDirection: "column",
        gap: 10,
        marginTop: 4,
      },

      sectionContentNoGap: {
        flexDirection: "column",
        gap: 0,
        marginTop: 6,
      },

      // Bold colored underline
      separator: {
        height: 2.5,
        width: "100%",
        backgroundColor: theme.color,
        opacity: 0.2,
        marginTop: 2,
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

      textSmMuted: {
        fontSize: theme.fontSize - 2,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        opacity: 0.7,
      },

      textXs: {
        fontSize: theme.fontSize - 4,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
      },

      headerInfoValue: {
        color: "#ffffff",
        fontSize: theme.fontSize,
      },

      title: {
        fontSize: theme.titleSize + 6,
        fontWeight: 700,
        color: "#ffffff",
        lineHeight: 1.05,
        textTransform: "uppercase",
        letterSpacing: 2,
      },

      subTitle: {
        fontSize: theme.subTitleSize + 1,
        fontWeight: 500,
        lineHeight: 1.3,
        color: "#ffffff",
        opacity: 0.9,
        letterSpacing: 1,
      },

      sectionTitle: {
        fontSize: theme.sectionTitleSize,
        fontWeight: 700,
        color: theme.color,
        textTransform: "uppercase",
        letterSpacing: 2,
      },

      label: {
        fontWeight: 600,
        minWidth: 70,
      },

      itemTitle: {
        fontWeight: 700,
        minWidth: 70,
        fontSize: theme.fontSize + 0.5,
        color: "#2a2a2a",
      },

      // Header info items (white text)
      informationGroup: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        gap: 4,
        flexWrap: "wrap",
      },

      informationItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      },

      informationLabel: {
        fontWeight: 700,
        color: "#ffffff",
        opacity: 0.7,
        fontSize: theme.fontSize - 1,
      },

      // Timeline styles for experience
      timelineItem: {
        flexDirection: "row",
        gap: 0,
      },

      timelineGutter: {
        width: 16,
        alignItems: "center",
        flexDirection: "column",
      },

      timelineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: theme.color,
      },

      timelineLine: {
        flex: 1,
        width: 1.5,
        backgroundColor: theme.color,
        opacity: 0.3,
      },

      timelineContent: {
        flex: 1,
        paddingLeft: 8,
        paddingBottom: 12,
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
        flexDirection: "column",
      },

      // Card-style project layout
      projectTable: {
        flexDirection: "column",
        gap: 0,
        backgroundColor: "#f8f9fa",
        borderRadius: 6,
        borderLeft: `3px solid ${theme.color}`,
        padding: 10,
        marginTop: 4,
      },

      projectTableRow: {
        flexDirection: "row",
        marginTop: 4,
      },

      projectTableFirstRow: {
        flexDirection: "row",
      },

      projectTableLabelCell: {
        paddingHorizontal: 4,
        paddingVertical: 3,
        width: 110,
        color: theme.color,
        fontWeight: 700,
        fontSize: theme.fontSize - 0.5,
      },

      projectTableValueCell: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 3,
      },
    });
  }, [templateFormat]);

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
