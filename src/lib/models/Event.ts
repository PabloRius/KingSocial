import { Prisma } from "@prisma/client";
import { z } from "zod";

export const eventParticipantSelect =
  Prisma.validator<Prisma.EventParticipantSelect>()({
    id: true,
    eventId: true,
    role: true,
    userId: true,
  });

export type EventParticipant = Prisma.EventParticipantGetPayload<{
  select: typeof eventParticipantSelect;
}>;

export const eventSelect = Prisma.validator<Prisma.EventSelect>()({
  id: true,
  title: true,
  description: true,
  coverImage: true,
  tags: true,
  public: true,

  creatorId: true,
  creator: { select: { user: { select: { id: true } } } },

  capacity: true,
  _count: { select: { participants: true } },
  participants: {
    select: {
      id: true,
      role: true,
      allowsMassMessages: true,
      user: { select: { image: true, name: true, username: true, id: true } },
    },
  },

  community: {
    select: { id: true, name: true, coverImage: true, description: true },
  },

  location_format: true,
  location: true,

  date: true,
  all_day: true,
  start_time: true,
  end_time: true,
});

export type Event = Prisma.EventGetPayload<{
  select: typeof eventSelect;
}>;

export type EventCreatePayload = {
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  public: boolean;

  capacity?: number;

  location_format: "in-person" | "online";
  location?: string;

  date: Date;
  all_day: boolean;
  start_time: string;
  end_time?: string;
};

export const eventCreateValidator = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title must be under 100 characters"),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(2000, "Description is too long"),

    coverImage: z.string().url("Cover image must be a valid URL"),

    tags: z
      .array(z.string())
      .max(10, "You can specify up to 10 tags")
      .default([]),

    public: z.boolean().default(false),

    capacity: z
      .number()
      .int()
      .positive("Capacity must be a positive number")
      .optional(),

    location_format: z.enum(["in-person", "online"]),
    location: z.string().optional(),

    date: z.date({
      required_error: "Event date is required",
      invalid_type_error: "Invalid date format",
    }),

    all_day: z.boolean().default(true),

    start_time: z.string().optional(),
    end_time: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.all_day && !data.start_time) {
        return false;
      }
      return true;
    },
    {
      message: "Start time is required for non all-day events",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.end_time > data.start_time;
      }
      return true;
    },
    {
      message: "End time must be later than start time",
      path: ["end_time"],
    }
  );
