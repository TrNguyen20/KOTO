import { MinnaLessonPack } from '@/lib/minna-types';

const lessonCache = new Map<number, MinnaLessonPack>();

async function loadUnitLessons(unitNum: number): Promise<MinnaLessonPack[]> {
  switch (unitNum) {
    case 1: {
      const mod = await import('@/lib/minna/n5-unit1');
      return mod.N5_UNIT_1_LESSONS;
    }
    case 2: {
      const mod = await import('@/lib/minna/n5-unit2');
      return mod.N5_UNIT_2_LESSONS;
    }
    case 3: {
      const mod = await import('@/lib/minna/n5-unit3');
      return mod.N5_UNIT_3_LESSONS;
    }
    case 4: {
      const mod = await import('@/lib/minna/n5-unit4');
      return mod.N5_UNIT_4_LESSONS;
    }
    case 5: {
      const mod = await import('@/lib/minna/n5-unit5');
      return mod.N5_UNIT_5_LESSONS;
    }
    default:
      return [];
  }
}

export function getUnitNumberForLesson(lessonNumber: number): number {
  if (lessonNumber < 1) return 1;
  return Math.ceil(lessonNumber / 5);
}

export function getCachedMinnaLessonPack(lessonNumber: number): MinnaLessonPack | null {
  return lessonCache.get(lessonNumber) ?? null;
}

export async function loadMinnaLessonPack(
  lessonNumber: number
): Promise<MinnaLessonPack | null> {
  if (lessonNumber < 1 || lessonNumber > 25) {
    return null;
  }
  const cached = lessonCache.get(lessonNumber);
  if (cached) return cached;

  const unitNum = getUnitNumberForLesson(lessonNumber);
  const unitLessons = await loadUnitLessons(unitNum);
  for (const pack of unitLessons) {
    lessonCache.set(pack.lessonNumber, pack);
  }
  return lessonCache.get(lessonNumber) ?? null;
}
