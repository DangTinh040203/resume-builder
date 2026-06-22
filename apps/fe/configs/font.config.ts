"use client";
import { Font } from "@react-pdf/renderer";

export interface FontOption {
  value: string;
  label: string;
  googleFontName: string;
  weights: number[];
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "Inter",
    label: "Inter",
    googleFontName: "Inter",
    weights: [400, 500, 600, 700],
  },
  {
    value: "Roboto",
    label: "Roboto",
    googleFontName: "Roboto",
    weights: [400, 500, 700],
  },
  {
    value: "Open Sans",
    label: "Open Sans",
    googleFontName: "Open+Sans",
    weights: [400, 500, 600, 700],
  },
  {
    value: "Lato",
    label: "Lato",
    googleFontName: "Lato",
    weights: [400, 700],
  },
  {
    value: "Lobster Two",
    label: "Lobster Two",
    googleFontName: "Lobster+Two",
    weights: [400, 500, 700],
  },
];

interface FontFile {
  src: string;
  fontWeight: number;
}

const FONT_FILES: Record<string, FontFile[]> = {
  Inter: [
    { src: "/fonts/inter/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/inter/Inter-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/inter/Inter-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/inter/Inter-Bold.ttf", fontWeight: 700 },
  ],
  Roboto: [
    { src: "/fonts/roboto/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/roboto/Roboto-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/roboto/Roboto-Medium.ttf", fontWeight: 600 },
    { src: "/fonts/roboto/Roboto-Bold.ttf", fontWeight: 700 },
  ],
  "Open Sans": [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/open-sans/OpenSans-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/open-sans/OpenSans-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: 700 },
  ],
  Lato: [
    { src: "/fonts/lato/Lato-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/lato/Lato-Regular.ttf", fontWeight: 500 },
    { src: "/fonts/lato/Lato-Bold.ttf", fontWeight: 600 },
    { src: "/fonts/lato/Lato-Bold.ttf", fontWeight: 700 },
  ],
  "Lobster Two": [
    { src: "/fonts/lobster-two/LobsterTwo-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/lobster-two/LobsterTwo-Regular.ttf", fontWeight: 500 },
    { src: "/fonts/lobster-two/LobsterTwo-Bold.ttf", fontWeight: 600 },
    { src: "/fonts/lobster-two/LobsterTwo-Bold.ttf", fontWeight: 700 },
  ],
};

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  for (const [family, fonts] of Object.entries(FONT_FILES)) {
    Font.register({
      family,
      fonts: fonts.flatMap((f) => [
        {
          src: f.src,
          fontWeight: f.fontWeight as 400 | 500 | 600 | 700,
          fontStyle: "normal" as const,
        },
        {
          src: f.src,
          fontWeight: f.fontWeight as 400 | 500 | 600 | 700,
          fontStyle: "italic" as const,
        },
      ]),
    });
  }
}
