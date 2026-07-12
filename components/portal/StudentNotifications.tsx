"use client"

import { useEffect, useState } from "react"
import { getStudentPendingNotifications, markStudentNotificationSeen, markAllStudentNotificationsSeen, NotificationItem } from "@/app/portal/notifications/actions"
import { getNotificationDestination } from "@/lib/utils/notifications"
import { Button } from "@/components/ui"
import { Bell, X, FileText, Video, CheckCheck } from "lucide-react"

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleMarkAllSeen}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {notifications.map(item => (
              <div key={`${item.resource_type}-${item.resource_id}`} className="group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkSeen(item, false);
                  }}
                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${item.resource_type === 'material' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {item.resource_type === 'material' ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 pr-6">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">New {item.resource_type} in {item.class_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={item.resource_type === 'material' ? 'success' : 'danger'}
                        className="py-1 px-3 text-xs min-h-[28px] h-7"
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
