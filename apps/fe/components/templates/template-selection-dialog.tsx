'use client';

import { Button } from '@resume-builder/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@resume-builder/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@resume-builder/ui/components/dialog';
import { motion } from 'framer-motion';
import { PenLine, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'upload' | 'scratch', file?: File) => void;
}

export const TemplateSelectionDialog = ({
  isOpen,
  isLoading = false,
  onOpenChange,
  onSelect,
}: TemplateSelectionDialogProps) => {
  const t = useTranslations('TemplateSelectionDialog');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingSteps = [0, 1, 2, 3, 0].map((index) =>
    t(`loading.steps.${index}`),
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleScratchClick = () => {
    onSelect('scratch');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect('upload', file);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={`w-[90vw] overflow-hidden rounded-xl sm:max-w-4xl`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader className='text-center'>
              <DialogTitle className='text-2xl font-bold'>
                {t('title')}
              </DialogTitle>
              <DialogDescription className='text-lg'>
                {t('description')}
              </DialogDescription>
            </DialogHeader>
          </motion.div>

          {isLoading ? (
            <div
              className={`flex min-h-[400px] flex-col items-center justify-center py-8`}
            >
              <div className='relative mb-8 h-32 w-32'>
                {/* Glowing background effect */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-blue-500/20 blur-2xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div
                  className={`relative flex h-full w-full items-center justify-center`}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative flex h-24 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm`}
                  >
                    <Upload className='text-primary/50 h-10 w-10' />

                    {/* Scanning Line */}
                    <motion.div
                      className={`absolute right-0 left-0 h-[2px] bg-linear-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                      animate={{
                        top: ['10%', '90%', '10%'],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>

                {/* Orbiting particles */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10`}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8 - i * 2,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.5,
                    }}
                  >
                    <motion.div
                      className={`absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-400`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4 text-center'
              >
                <div className='relative h-8 overflow-hidden'>
                  <motion.div
                    animate={{
                      y: [0, 0, -32, -32, -64, -64, -96, -96, -128],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.95, 1],
                    }}
                    className='flex flex-col items-center'
                  >
                    {loadingSteps.map((text, i) => (
                      <h3
                        key={i}
                        className={`h-8 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent`}
                      >
                        {text}
                      </h3>
                    ))}
                  </motion.div>
                </div>

                <p
                  className={`text-muted-foreground mx-auto max-w-[300px] text-sm`}
                >
                  {t('loading.description')}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 py-8 md:grid-cols-2`}>
              <div>
                <Card
                  className={`hover:border-primary hover:bg-muted/50 cursor-pointer transition-all`}
                  onClick={handleUploadClick}
                >
                  <CardContent
                    className={`flex flex-col items-center justify-center gap-4 p-8 text-center`}
                  >
                    <div
                      className={`bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full`}
                    >
                      <Upload className='text-primary h-8 w-8' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle>{t('upload.title')}</CardTitle>
                      <CardDescription>
                        {t('upload.description')}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card
                  className={`hover:border-primary hover:bg-muted/50 cursor-pointer transition-all`}
                  onClick={handleScratchClick}
                >
                  <CardContent
                    className={`flex flex-col items-center justify-center gap-4 p-8 text-center`}
                  >
                    <div
                      className={`bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full`}
                    >
                      <PenLine className='text-primary h-8 w-8' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle>{t('scratch.title')}</CardTitle>
                      <CardDescription>
                        {t('scratch.description')}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter className='flex items-center justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='.pdf'
        onChange={handleFileChange}
      />
    </>
  );
};
