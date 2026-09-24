import { create } from "zustand";

type LearningStore = {
  selectedCourseId: string | null;
  setSelectedCourseId: (courseId: string) => void;
  clearSelectedCourse: () => void;
};

export const useLearningStore = create<LearningStore>((set) => ({
  selectedCourseId: null,

  setSelectedCourseId: (courseId) =>
    set({
      selectedCourseId: courseId,
    }),

  clearSelectedCourse: () =>
    set({
      selectedCourseId: null,
    }),
}));