import { Text, View } from "@rawwee/react-pdf-html";
import { StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

import { type Format } from "@/stores/features/template.slice";

export const useTemplate02Style = (templateFormat: Format) => {
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
        padding: theme.margin + 5,
        flexDirection: "column",
        rowGap: theme.sectionSpacing + 2,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        fontWeight: fontWeightValue,
        fontFamily: theme.fontFamily,
        backgroundColor: "#ffffff",
      },

      section: {
        flexDirection: "column",
        width: "100%",
        gap: 4,
      },

      sectionContent: {
        flexDirection: "column",
        gap: 10,
        marginTop: 4,
      },

      // Modern accent bar instead of full-width gray line
      separator: {
        height: 2.5,
        width: 30,
        backgroundColor: theme.color,
        borderRadius: 2,
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

      textXs: {
        fontSize: theme.fontSize - 4,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
      },

      // Centered header with color accent
      title: {
        fontSize: theme.titleSize + 4,
        fontWeight: 700,
        color: theme.color,
        lineHeight: 1.1,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 3,
      },

      subTitle: {
        fontSize: theme.subTitleSize,
        fontWeight: 500,
        lineHeight: 1.3,
        textAlign: "center",
        color: "#555555",
      },

      // Uppercase section titles with wide letter spacing
      sectionTitle: {
        fontSize: theme.sectionTitleSize - 1,
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
        color: "#333333",
      },

      // Centered single-row info with dot separators
      informationGroup: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        gap: 20,
        flexWrap: "wrap",
      },

      informationItem: {
        flexDirection: "row",
        fontStyle: "normal",
        alignItems: "center",
      },

      informationLabel: {
        fontWeight: 600,
        minWidth: 0,
        color: theme.color,
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

      // Modern borderless project layout
      projectTable: {
        flexDirection: "column",
        gap: 0,
        backgroundColor: "#fafafa",
        borderRadius: 4,
        padding: 8,
        marginTop: 4,
      },

      projectTableRow: {
        flexDirection: "row",
        borderTop: "0.5px solid #e5e5e5",
        paddingTop: 4,
      },

      projectTableFirstRow: {
        flexDirection: "row",
      },

      projectTableLabelCell: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        width: 110,
        color: theme.color,
        fontWeight: 600,
      },

      projectTableValueCell: {
        flex: 1,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginBottom: -2,
      },
    });
  }, [templateFormat]);

  // TableRow with modern styling
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
