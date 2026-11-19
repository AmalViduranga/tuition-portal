"use client"

import { useEffect, useRef, useState } from "react"
import { getStudentPendingNotifications, markStudentNotificationSeen, markAllStudentNotificationsSeen, NotificationItem } from "@/app/portal/notifications/actions"
import { getNotificationDestination } from "@/lib/utils/notifications"
import { Button } from "@/components/ui"
import { Bell, X, FileText, Video, CheckCheck } from "lucide-react"

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudentPendingNotifications()
        setNotifications(data)
      } catch (err) {
        console.error("Failed to load notifications", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  if (loading || notifications.length === 0) return null

  const handleMarkSeen = async (item: NotificationItem, navigate: boolean) => {
    try {
      await markStudentNotificationSeen(item.resource_type, item.resource_id)
      setNotifications(prev => prev.filter(n => n.resource_id !== item.resource_id))
      if (navigate) {
        window.location.href = getNotificationDestination({
          resourceType: item.resource_type,
          resourceId: item.resource_id,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllSeen = async () => {
    try {
      await markAllStudentNotificationsSeen(notifications)
      setNotifications([])
      setIsOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative flex items-center justify-center p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Notifications (${notifications.length} unread)`}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        <span className="absolute top-1.5 right-1.5 inline-flex rounded-full h-2 w-2 bg-rose-600" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-lg border border-border z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/60">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleMarkAllSeen}
                className="text-xs text-link hover:underline font-medium flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {notifications.map(item => (
              <div key={`${item.resource_type}-${item.resource_id}`} className="group p-3 rounded-lg hover:bg-muted/60 transition-colors border border-transparent hover:border-border relative">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkSeen(item, false);
                  }}
                  className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${item.resource_type === 'material' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    {item.resource_type === 'material' ? <FileText className="w-4 h-4" aria-hidden="true" /> : <Video className="w-4 h-4" aria-hidden="true" />}
                  </div>
                  <div className="flex-1 pr-6">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">New {item.resource_type} in {item.class_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={item.resource_type === 'material' ? 'success' : 'primary'}
                        className="py-1 px-3 text-xs min-h-[30px]"
                        onClick={() => handleMarkSeen(item, true)}
                      >
                        {item.resource_type === 'material' ? 'View Material' : 'Watch Recording'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
