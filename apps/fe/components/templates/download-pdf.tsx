'use client';

import { usePDFComponentsAreHTML } from '@rawwee/react-pdf-html';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@resume-builder/ui/components/button';
import { toast } from '@resume-builder/ui/components/sonner';
import dayjs from 'dayjs';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import slugify from 'slugify';

import DocumentPDF from '@/components/templates/document-pdf';
import { registerFonts } from '@/configs/font.config';
import { TEMPLATES } from '@/configs/template.config';
import {
  templateFormatSelector,
  templateSelectedSelector,
} from '@/stores/features/template.slice';
import { useAppSelector } from '@/stores/store';
import { type Resume } from '@/types/resume.type';

// Ensure fonts are registered for @react-pdf/renderer before PDF generation
registerFonts();

interface DownloadPdfProps {
  resume: Resume;
}

const DownloadPdf: React.FC<DownloadPdfProps> = ({ resume }) => {
  const t = useTranslations('Builder');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const { isHTML, setHtml } = usePDFComponentsAreHTML();

  const templateSelected = useAppSelector(templateSelectedSelector);
  const templateFormat = useAppSelector(templateFormatSelector);

  const handleDownload = async () => {
    if (!templateSelected) {
      toast.error(t('downloadPdf.selectTemplate'));
      return;
    }

    setHtml(false);
    setIsProcessing(true);

    setTimeout(() => {
      if (isHTML) {
        setShouldRender(true);
      }
    }, 0);
  };

  useEffect(() => {
    if (!shouldRender || !resume || !templateSelected) return;

    const generate = async () => {
      try {
        const templateProfile = TEMPLATES[templateSelected];
        if (!templateProfile) return;
        const Template = templateProfile.component;

        const doc = (
          <DocumentPDF
            document={
              <Template templateFormat={templateFormat} resume={resume} />
            }
          />
        );

        const blob = await pdf(doc).toBlob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${slugify(`${resume.title} ${resume.subTitle}`)}-${dayjs(Date.now()).format('YYYY-MM-DD')}.pdf`;
        link.click();

        URL.revokeObjectURL(blobUrl);
      } catch {
        toast.error(t('downloadPdf.failed'));
      } finally {
        setHtml(true);
        setIsProcessing(false);
        setShouldRender(false);
      }
    };

    void generate();
  }, [shouldRender, templateFormat, setHtml, resume, templateSelected, t]);

  return (
    <Button
      disabled={isProcessing}
      onClick={handleDownload}
      variant='outline'
      className={`
        w-full shrink-0 gap-2 shadow-2xl
        sm:w-auto
      `}
    >
      <Download className='h-4 w-4' />
      {t('downloadPdf.export')}
    </Button>
  );
};

export default DownloadPdf;
