import { Text, View } from "@rawwee/react-pdf-html";
import { StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

import { type Format } from "@/stores/features/template.slice";

export const useTemplate03Style = (templateFormat: Format) => {
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
        flexDirection: "row",
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        fontWeight: fontWeightValue,
        fontFamily: theme.fontFamily,
        backgroundColor: "#ffffff",
      },

      // ── Sidebar (left column) ──
      sidebar: {
        width: "32%",
        backgroundColor: theme.color,
        paddingVertical: theme.margin + 5,
        paddingHorizontal: 16,
        flexDirection: "column",
        gap: theme.sectionSpacing + 4,
        color: "#ffffff",
      },

      sidebarSection: {
        flexDirection: "column",
        gap: 4,
      },

      sidebarSectionTitle: {
        fontSize: theme.sectionTitleSize - 1,
        fontWeight: 700,
        color: "#ffffff",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        opacity: 0.9,
        marginBottom: 2,
      },

      sidebarSeparator: {
        height: 1,
        width: "100%",
        backgroundColor: "#ffffff",
        opacity: 0.3,
        marginBottom: 4,
      },

      sidebarText: {
        fontSize: theme.fontSize,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.95,
      },

      sidebarTextBold: {
        fontSize: theme.fontSize,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.95,
        fontWeight: 600,
      },

      sidebarTextLight: {
        fontSize: theme.fontSize,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.85,
      },

      sidebarTextLighter: {
        fontSize: theme.fontSize,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.8,
      },

      sidebarTextSmMuted: {
        fontSize: theme.fontSize - 1,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.65,
      },

      sidebarTextSmMuted75: {
        fontSize: theme.fontSize - 1,
        color: "#ffffff",
        lineHeight: theme.lineHeight,
        opacity: 0.75,
      },

      sidebarItemStack: {
        marginBottom: 2,
        display: "flex",
        flexDirection: "column",
      },

      sidebarItemStackWithGap: {
        gap: 6,
        marginBottom: 2,
        display: "flex",
        flexDirection: "column",
      },

      sidebarItemStackLg: {
        marginBottom: 4,
        display: "flex",
        flexDirection: "column",
      },

      sidebarItemCompact: {
        marginBottom: 3,
      },

      // ── Main content (right column) ──
      main: {
        flex: 1,
        padding: theme.margin,
        flexDirection: "column",
        gap: theme.sectionSpacing,
      },

      section: {
        flexDirection: "column",
        width: "100%",
        gap: 2,
      },

      sectionContent: {
        flexDirection: "column",
        gap: 10,
        marginTop: 4,
      },

      separator: {
        height: 2,
        width: 40,
        backgroundColor: theme.color,
        borderRadius: 1,
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

      title: {
        fontSize: theme.titleSize + 2,
        fontWeight: 700,
        color: "#ffffff",
        lineHeight: 1.1,
        letterSpacing: 1,
      },

      subTitle: {
        fontSize: theme.subTitleSize,
        fontWeight: 500,
        lineHeight: 1.3,
        color: "#ffffff",
        opacity: 0.85,
      },

      sectionTitle: {
        fontSize: theme.sectionTitleSize,
        fontWeight: 700,
        color: theme.color,
        letterSpacing: 1,
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

      informationGroup: {
        flexDirection: "column",
        width: "100%",
        gap: 6,
      },

      informationItem: {
        flexDirection: "column",
        gap: 1,
      },

      informationLabel: {
        fontWeight: 700,
        fontSize: theme.fontSize - 1,
        color: "#ffffff",
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 0.5,
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

      projectTable: {
        flexDirection: "column",
        gap: 0,
        borderLeft: `2px solid ${theme.color}`,
        paddingLeft: 10,
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
        width: 105,
        color: theme.color,
        fontWeight: 600,
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
