import { toast } from '@resume-builder/ui/components/sonner';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector, setResume } from '@/stores/features/resume.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type ErrorResponse } from '@/types/error.response';
import { resumeToUpdateDto } from '@/utils/resume.utils';
import { toastErrorMessage } from '@/utils/toast-error-message.util';

/**
 * Custom hook to sync Redux resume state to backend.
 * Use this in forms - dispatch changes to store, call sync() on submit/next.
 *
 * NOTE: Ctrl+S shortcut is handled globally by useGlobalSaveShortcut().
 * Do NOT register keyboard listeners here to avoid duplicate requests.
 */
export function useSyncResume() {
  const t = useTranslations('Builder');
  const dispatch = useAppDispatch();
  const { resume } = useAppSelector(resumeSelector);
  const resumeService = useService(ResumeService);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!resume) {
      toast.error(t('sync.noResume'));
      return false;
    }

    // Prevent concurrent sync requests
    if (isSyncingRef.current) {
      return false;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const updatedResume = await resumeService.updateResume(
        resume.id,
        resumeToUpdateDto(resume),
      );
      dispatch(setResume(updatedResume));
      return true;
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as ErrorResponse;
        toastErrorMessage(error.message);
      } else {
        toast.error(t('sync.genericError'));
      }

      return false;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [dispatch, resume, resumeService, t]);

  return { sync, isSyncing, resume };
}
