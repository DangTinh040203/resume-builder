"use client";
import { usePDFComponentsAreHTML } from "@rawwee/react-pdf-html";
import { Html } from "react-pdf-html";

export interface HtmlToPdf {
  content: string;
  style: React.CSSProperties;
}

type HtmlToPdfProps = Partial<HtmlToPdf>;

const HtmlToPdf = ({ content = "", style = {} }: HtmlToPdfProps) => {
  const { isHTML } = usePDFComponentsAreHTML();

  if (!content.trim()) return null;

  // Replace &nbsp; with regular space to allow text wrapping,
  // but keep &nbsp; that is at a tag boundary (after > or before <) to prevent react-pdf from collapsing spaces

  let normalizedContent = content;

  // 1. Convert spaces around inline tags to &nbsp;
  const inlineTags = "strong|b|i|em|u|span|a|code|s|strike";

  // Replace space AFTER tag: </strong> space -> </strong>&nbsp;
  normalizedContent = normalizedContent.replace(
    new RegExp(`((?:<\\/?(?:${inlineTags})[^>]*>)) `, "gi"),
    "$1&nbsp;",
  );

  // Replace space BEFORE tag: space <strong> -> &nbsp;<strong>
  normalizedContent = normalizedContent.replace(
    new RegExp(` ((?:<\\/?(?:${inlineTags})[^>]*>))`, "gi"),
    "&nbsp;$1",
  );

  // 2. Replace &nbsp; with regular space ONLY if it's surrounded by non-tag chars
  // (i.e. not >&nbsp; and not &nbsp;<)
  normalizedContent = normalizedContent.replace(/([^>])&nbsp;([^<])/g, "$1 $2");

  if (isHTML) {
    return (
      <div
        style={{ fontFamily: "inherit", ...style }}
        className="prose text-foreground m-0 max-w-full p-0"
        dangerouslySetInnerHTML={{ __html: normalizedContent }}
      />
    );
  }

  // Reset default browser styles that react-pdf-html might apply
  const resetStylesheet = {
    p: { margin: 0, padding: 0, lineHeight: 1 },
    h1: { margin: 0, padding: 0 },
    h2: { margin: 0, padding: 0 },
    h3: { margin: 0, padding: 0 },
    h4: { margin: 0, padding: 0 },
    h5: { margin: 0, padding: 0 },
    h6: { margin: 0, padding: 0 },
    ul: { margin: 0, padding: 0 },
    ol: { margin: 0, padding: 0 },
    li: { margin: 0, padding: 0 },
    div: { margin: 0, padding: 0, lineHeight: 1 },
    body: { margin: 0, padding: 0, lineHeight: 1 },
  };

  return (
    <Html stylesheet={resetStylesheet} style={{ ...style }}>
      {normalizedContent}
    </Html>
  );
};

export default HtmlToPdf;
