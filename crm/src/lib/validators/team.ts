import { AttendanceStatus } from "@prisma/client";
import { z } from "zod";

export const attendanceSchema = z.object({
  userId: z.string().min(1),
  date: z.coerce.date().optional(),
  status: z.nativeEnum(AttendanceStatus),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
});
