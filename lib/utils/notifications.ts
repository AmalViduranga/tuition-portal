export type NotificationResourceType = "recording" | "material";

export type NotificationDestinationInput = {
  resourceType: NotificationResourceType;
  resourceId: string;
};

/**
 * Builds the correct destination URL for a notification, utilizing the global list pages
 * to ensure that access works regardless of whether the student is enrolled in a specific class
 * or gained access via an individual unlock.
 */
export function getNotificationDestination({
  resourceType,
  resourceId,
}: NotificationDestinationInput): string {
  if (resourceType === "recording") {
    return `/portal/recordings?highlight=${resourceId}#${resourceId}`;
  }
  return `/portal/materials?highlight=${resourceId}#${resourceId}`;
}
