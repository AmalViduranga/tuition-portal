import { revalidatePath } from "next/cache";

export const CLASS_REVALIDATION_PATHS = [
  "/",
  "/schedule",
  "/api/public/site-content",
  "/portal",
  "/portal/classes",
  "/portal/recordings",
  "/portal/materials",
  "/dashboard",
  "/dashboard/profile",
  "/admin/classes",
] as const;

export function revalidateClassViews(): void {
  for (const path of CLASS_REVALIDATION_PATHS) {
    revalidatePath(path);
  }
}
