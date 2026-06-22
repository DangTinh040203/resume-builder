import { StyleSheet } from "@react-pdf/renderer";

export const templateGlobalStyles = StyleSheet.create({
  page: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  gapSm: { gap: 10 },
  gapMd: { gap: 18 },
  gapLg: { gap: 25 },
  gapXl: { gap: 35 },

  flexRow: {
    display: "flex",
    flexDirection: "row",
  },

  flexCol: {
    display: "flex",
    flexDirection: "column",
  },

  gap2xl: { gap: 50 },

  fontWeight300: { fontWeight: 300 },
  fontWeight400: { fontWeight: 400 },
  fontWeight500: { fontWeight: 500 },
  fontWeight600: { fontWeight: 600 },
  fontWeight700: { fontWeight: 700 },
  fontWeight800: { fontWeight: 800 },
  fontWeight900: { fontWeight: 900 },

  fontItalic: { fontStyle: "italic" },
  fontItalic500: { fontStyle: "italic", fontWeight: 500 },
  fontItalic600: { fontStyle: "italic", fontWeight: 600 },
  fontItalic700: { fontStyle: "italic", fontWeight: 700 },
  fontItalic800: { fontStyle: "italic", fontWeight: 800 },
  fontItalic900: { fontStyle: "italic", fontWeight: 900 },

  heading1: { fontSize: 35 },
  heading2: { fontSize: 20 },
  heading3: { fontSize: 15 },
  heading4: { fontSize: 13 },
  heading5: { fontSize: 10 },
  textBase: { fontSize: 12 },

  textRight: { textAlign: "right" },
  textLeft: { textAlign: "left" },
  textCenter: { textAlign: "center" },

  underline: { textDecoration: "underline" },
});
