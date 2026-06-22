"use client";
import { Document } from "@rawwee/react-pdf-html";
import { type DocumentProps } from "@react-pdf/renderer";
import { type ReactElement } from "react";

interface DocumentPDFProps {
  document: ReactElement<DocumentProps>;
}

const DocumentPDF = ({ document }: DocumentPDFProps) => {
  return <Document>{document}</Document>;
};

export default DocumentPDF;
