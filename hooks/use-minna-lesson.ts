'use client';

import { useEffect, useState } from 'react';
import { getLessonMeta } from '@/lib/minna-index';
import { getCachedMinnaLessonPack, loadMinnaLessonPack } from '@/lib/minna/loader';
import { MinnaLessonMeta, MinnaLessonPack } from '@/lib/minna-types';

export interface UseMinnaLessonResult {
  meta: MinnaLessonMeta;
  pack: MinnaLessonPack | null;
  loading: boolean;
}

export function useMinnaLesson(lessonNumber: number): UseMinnaLessonResult {
  const meta = getLessonMeta(lessonNumber);
  const cached = getCachedMinnaLessonPack(lessonNumber);

  const [state, setState] = useState<{
    loadedFor: number;
    pack: MinnaLessonPack | null;
  }>(() => ({
    loadedFor: cached ? lessonNumber : -1,
    pack: cached,
  }));

  useEffect(() => {
    let cancelled = false;
    const hit = getCachedMinnaLessonPack(lessonNumber);
    if (hit) {
      queueMicrotask(() => {
        if (!cancelled) {
          setState({ loadedFor: lessonNumber, pack: hit });
        }
      });
      return () => {
        cancelled = true;
      };
    }

    loadMinnaLessonPack(lessonNumber)
      .then((loaded) => {
        if (!cancelled) {
          setState({ loadedFor: lessonNumber, pack: loaded });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ loadedFor: lessonNumber, pack: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lessonNumber]);

  const isAvailable = meta.status === 'available';
  const currentPack =
    cached ?? (state.loadedFor === lessonNumber ? state.pack : null);
  const loading = isAvailable && state.loadedFor !== lessonNumber && !cached;

  return {
    meta,
    pack: isAvailable ? currentPack : null,
    loading,
  };
}
