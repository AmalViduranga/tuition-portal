"use server"

import { requireUser } from "@/lib/auth"
import { loadStudentRecordings } from "@/lib/recordings/student-recordings"
import { loadStudentMaterials } from "@/lib/materials/student-materials"

export type NotificationItem = {
  resource_type: "material" | "recording"
  resource_id: string
  title: string
  class_name: string
  class_id: string
  release_at: string
}

export async function getStudentPendingNotifications(): Promise<NotificationItem[]> {
  const { supabase, user } = await requireUser()

  // Ensure active student
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single()

  if (!profile?.is_active || profile.role === "admin") {
    return []
  }

  // Fetch all accessible items
  const [recordingsPayload, materialsPayload] = await Promise.all([
    loadStudentRecordings(supabase, user.id, null),
    loadStudentMaterials(supabase, user.id, null)
  ])

  // Get already seen notifications
  const { data: seenReads } = await supabase
    .from("student_notification_reads")
    .select("resource_type, resource_id")
    .eq("student_id", user.id)

  const seenSet = new Set(
    (seenReads || []).map((r: any) => `${r.resource_type}:${r.resource_id}`)
  )

  const notifications: NotificationItem[] = []

  for (const rec of recordingsPayload.recordings) {
    if (!seenSet.has(`recording:${rec.id}`)) {
      notifications.push({
        resource_type: "recording",
        resource_id: rec.id,
        title: rec.title,
        class_name: rec.class_groups?.name || "Unknown Class",
        class_id: rec.class_id,
        release_at: rec.release_at
      })
    }
  }

  for (const mat of materialsPayload.materials) {
    if (!seenSet.has(`material:${mat.id}`)) {
      notifications.push({
        resource_type: "material",
        resource_id: mat.id,
        title: mat.title,
        class_name: mat.class_groups?.name || "Unknown Class",
        class_id: mat.class_id,
        release_at: mat.release_at
      })
    }
  }

  // Sort latest first
  notifications.sort((a, b) => new Date(b.release_at).getTime() - new Date(a.release_at).getTime())

  // Limit to max 10
  return notifications.slice(0, 10)
}

export async function markStudentNotificationSeen(resourceType: "material" | "recording", resourceId: string) {
  const { supabase, user } = await requireUser()

  if (resourceType !== "material" && resourceType !== "recording") {
    throw new Error("Invalid resource type")
  }

  // Verify access before marking as seen
  let hasAccess = false
  if (resourceType === "recording") {
    const payload = await loadStudentRecordings(supabase, user.id, null)
    hasAccess = payload.recordings.some((r: any) => r.id === resourceId)
  } else {
    const payload = await loadStudentMaterials(supabase, user.id, null)
    hasAccess = payload.materials.some((m: any) => m.id === resourceId)
  }

  if (!hasAccess) {
    throw new Error("Resource not accessible")
  }

  const { error } = await supabase
    .from("student_notification_reads")
    .upsert({
      student_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId
    }, { onConflict: "student_id, resource_type, resource_id" })

  if (error) {
    console.error("Error marking notification seen:", error)
    throw new Error("Failed to mark as seen")
  }
}

export async function markAllStudentNotificationsSeen(items: {resource_type: "material" | "recording", resource_id: string}[]) {
  const { supabase, user } = await requireUser()

  const validItems = items.filter(i => i.resource_type === "material" || i.resource_type === "recording")
  if (validItems.length === 0) return

  // Check access in bulk by loading all accessible resources
  const [recordingsPayload, materialsPayload] = await Promise.all([
    loadStudentRecordings(supabase, user.id, null),
    loadStudentMaterials(supabase, user.id, null)
  ])

  const accessibleSet = new Set([
    ...recordingsPayload.recordings.map((r: any) => `recording:${r.id}`),
    ...materialsPayload.materials.map((m: any) => `material:${m.id}`)
  ])

  const toInsert = validItems
    .filter(i => accessibleSet.has(`${i.resource_type}:${i.resource_id}`))
    .map(i => ({
      student_id: user.id,
      resource_type: i.resource_type,
      resource_id: i.resource_id
    }))

  if (toInsert.length > 0) {
    await supabase.from("student_notification_reads").upsert(toInsert, { onConflict: "student_id, resource_type, resource_id" })
  }
}
