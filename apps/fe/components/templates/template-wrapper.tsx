'use client';
import { type DocumentProps } from '@react-pdf/renderer';
import { Spinner } from '@resume-builder/ui/components/spinner';
import { type ReactElement, useMemo } from 'react';
import { useMeasure } from 'react-use';

import DocumentPDF from '@/components/templates/document-pdf';
import { registerFonts } from '@/configs/font.config';
import { type Format } from '@/stores/features/template.slice';
import { type Resume } from '@/types/resume.type';

// Register all fonts for @react-pdf/renderer at module load
registerFonts();

export interface TemplateProp {
  templateFormat: Format;
  resume: Resume;
}

export interface Size {
  width: number;
  height: number;
}

export const A4_SIZE: Size = {
  width: 21,
  height: 29.7,
} as const;

export const A4_PX_SIZE = {
  width: 595.28, // 21cm * 72dpi / 2.54
  height: 841.89, // 29.7cm * 72dpi / 2.54
};

const DEFAULT_DOCUMENT_SIZE = A4_PX_SIZE;

interface TemplateWrapperProps {
  document: ReactElement<DocumentProps>;
  scrollable?: boolean;
  selectable?: boolean;
  fontFamily?: string;
}

const TemplateWrapper = ({
  document,
  scrollable = true,
  selectable = true,
  fontFamily,
}: TemplateWrapperProps) => {
  const [ref, bounds] = useMeasure<HTMLDivElement>();

  const size = useMemo(() => {
    const width = bounds.width || DEFAULT_DOCUMENT_SIZE.width;
    return {
      height:
        (DEFAULT_DOCUMENT_SIZE.height * width) / DEFAULT_DOCUMENT_SIZE.width,
      scale: width / DEFAULT_DOCUMENT_SIZE.width,
    };
  }, [bounds.width]);

  const ready = bounds.width > 0;

  return (
    <div
      ref={ref}
      className={`border/10 bg-background relative z-10 w-full scrollbar-none overflow-hidden rounded-lg border shadow-xl ${
        scrollable ? `overflow-y-auto` : ''
      } ${!selectable ? `select-none` : ''} `}
      style={{ aspectRatio: '210 / 297' }}
    >
      {!ready ? (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div
          className='absolute top-0 left-0 z-50 origin-top-left'
          style={{
            width: DEFAULT_DOCUMENT_SIZE.width,
            height: DEFAULT_DOCUMENT_SIZE.height,
            transform: `scale(${size.scale})`,
            fontFamily: fontFamily || undefined,
          }}
        >
          <DocumentPDF document={document} />
        </div>
      )}
    </div>
  );
};

export default TemplateWrapper;
