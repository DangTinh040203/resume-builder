import { Text, View } from "@rawwee/react-pdf-html";
import { StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

import { type Format } from "@/stores/features/template.slice";

export const useTemplate04Style = (templateFormat: Format) => {
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
        padding: theme.margin - 2,
        flexDirection: "column",
        rowGap: theme.sectionSpacing - 2,
        fontSize: theme.fontSize - 0.5,
        lineHeight: theme.lineHeight - 0.1,
        letterSpacing: theme.letterSpacing,
        fontWeight: fontWeightValue,
        fontFamily: theme.fontFamily,
        backgroundColor: "#ffffff",
      },

      // ── Compact header: name + subtitle inline ──
      header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: `2px solid ${theme.color}`,
        paddingBottom: 6,
      },

      headerLeft: {
        flexDirection: "column",
      },

      section: {
        flexDirection: "column",
        width: "100%",
        gap: 2,
      },

      sectionContent: {
        flexDirection: "column",
        gap: 6,
        marginTop: 3,
      },

      // Dotted separator
      separator: {
        height: 0,
        width: "100%",
        borderBottom: "0.8px dotted #999999",
        marginTop: 1,
      },

      text: {
        fontSize: theme.fontSize - 0.5,
        lineHeight: theme.lineHeight - 0.1,
        letterSpacing: theme.letterSpacing,
      },

      textSm: {
        fontSize: theme.fontSize - 2.5,
        lineHeight: theme.lineHeight - 0.1,
        letterSpacing: theme.letterSpacing,
      },

      textXs: {
        fontSize: theme.fontSize - 4,
        lineHeight: theme.lineHeight - 0.1,
        letterSpacing: theme.letterSpacing,
      },

      title: {
        fontSize: theme.titleSize - 2,
        fontWeight: 700,
        color: theme.color,
        lineHeight: 1.1,
      },

      subTitle: {
        fontSize: theme.subTitleSize - 2,
        fontWeight: 500,
        lineHeight: 1.2,
        color: "#555555",
      },

      sectionTitle: {
        fontSize: theme.sectionTitleSize - 1,
        fontWeight: 700,
        color: theme.color,
        textTransform: "uppercase",
        letterSpacing: 1.5,
      },

      label: {
        fontWeight: 600,
        minWidth: 60,
      },

      itemTitle: {
        fontWeight: 700,
        fontSize: theme.fontSize,
        color: "#333333",
      },

      // Compact: info displayed in a tight row
      informationGroup: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        gap: 12,
        flexWrap: "wrap",
      },

      informationItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
      },

      informationLabel: {
        fontWeight: 600,
        color: theme.color,
        fontSize: theme.fontSize - 1.5,
      },

      row: {
        flexDirection: "row",
        gap: 8,
      },

      rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
      },

      col: {
        flexDirection: "column",
      },

      // Two-column grid for short sections
      twoColGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
      },

      twoColItem: {
        width: "48%",
        flexDirection: "row",
        gap: 6,
        marginBottom: 2,
      },

      projectTable: {
        flexDirection: "column",
        gap: 0,
        border: "0.5px solid #e0e0e0",
        borderRadius: 3,
        marginTop: 3,
      },

      projectTableRow: {
        flexDirection: "row",
        borderTop: "0.5px solid #e0e0e0",
      },

      projectTableFirstRow: {
        flexDirection: "row",
      },

      projectTableLabelCell: {
        borderRight: "0.5px solid #e0e0e0",
        paddingHorizontal: 6,
        paddingVertical: 3,
        width: 100,
        fontWeight: 600,
        color: "#555555",
        fontSize: theme.fontSize - 1,
      },

      projectTableValueCell: {
        flex: 1,
        paddingHorizontal: 6,
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
