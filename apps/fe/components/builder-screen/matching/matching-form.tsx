import { Button } from '@resume-builder/ui/components/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@resume-builder/ui/components/tabs';
import { Textarea } from '@resume-builder/ui/components/textarea';
import { ClipboardList, ScanSearch, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

interface MatchingFormProps {
  jdText: string;
  setJdText: (text: string) => void;
  jdFile: File | null;
  setJdFile: (file: File | null) => void;
  onAnalyze: () => void;
}

export const MatchingForm = ({
  jdText,
  setJdText,
  jdFile,
  setJdFile,
  onAnalyze,
}: MatchingFormProps) => {
  const t = useTranslations('Matching');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJdFile(file);
    }
  };

  const hasInput = jdText.trim().length > 0 || jdFile !== null;

  return (
    <>
      <Tabs defaultValue='text' className='space-y-4 pt-4'>
        <TabsList
          className={`mx-auto flex w-fit items-center justify-center border`}
        >
          <TabsTrigger className='px-10' value='text'>
            <ClipboardList className='mr-2 h-4 w-4' /> {t('form.textTab')}
          </TabsTrigger>
          <TabsTrigger className='px-10' value='file'>
            <Upload className='mr-2 h-4 w-4' /> {t('form.fileTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='text' className='mt-4'>
          <Textarea
            className='h-64 resize-none scrollbar-thin overflow-y-auto'
            placeholder={t('form.jdPlaceholder')}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </TabsContent>

        <TabsContent value='file' className='mt-4'>
          <input
            ref={fileInputRef}
            type='file'
            accept='.pdf'
            className='hidden'
            onChange={handleFileChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-primary flex h-64 cursor-pointer flex-col items-center
              justify-center gap-3 rounded-lg border-2 border-dashed px-3 py-2
              transition-all
              hover:bg-muted/50
            `}
          >
            <div
              className={`
                bg-primary/10 flex h-14 w-14 items-center justify-center
                rounded-full
              `}
            >
              <Upload className='text-primary h-6 w-6' />
            </div>
            <div className='text-center'>
              {jdFile ? (
                <>
                  <p className='text-primary text-sm font-medium'>
                    {jdFile.name}
                  </p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {t('form.changeFile')}
                  </p>
                </>
              ) : (
                <>
                  <p className='text-sm font-medium'>{t('form.uploadFile')}</p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {t('form.fileHint')}
                  </p>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className='pt-2'>
        <Button onClick={onAnalyze} disabled={!hasInput} className='w-full'>
          <ScanSearch className='mr-2' /> {t('form.analyze')}
        </Button>
      </div>
    </>
  );
};
