import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Course title must be at least 3 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),

  categoryId: z
    .string()
    .min(1, "Please select a category"),
});

export const lessonSchema = z.object({
  title: z
    .string()
    .min(3, "Lesson title must be at least 3 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters"),

  lessonOrder: z
    .number()
    .int()
    .positive("Lesson order must be greater than 0"),
});