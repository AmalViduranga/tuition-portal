"use client";

import { useState, useEffect } from "react";
import { updateSiteContent } from "@/app/admin/actions";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui";

const CONTENT_KEYS = {
  site_name: "Site Name",
  teacher_name: "Teacher Name",
  teacher_qualification: "Teacher Qualification",
  teacher_description: "Teacher Description",
  subject_name: "Subject Name",
  subject_code: "Subject Code",
  subject_description: "Subject Description",
} as const;

export default function AdminSiteContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/site-content");
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();

      const contentMap: Record<string, string> = {};
      data.forEach((item: { key: string; value: string }) => {
        contentMap[item.key] = item.value || "";
      });
      setContent(contentMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(content).forEach(([key, val]) => formData.append(key, val));

      await updateSiteContent(formData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchContent(); // Reload the updated image URL from server
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess(false);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Site Content</h1>
        <p className="text-sm text-slate-600 mt-1">Manage public website content and teacher information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">General Settings</h2>
              <div className="space-y-4">
                <Input
                  label="Site Name"
                  value={content.site_name || ""}
                  onChange={(e) => handleChange("site_name", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Teacher Information</h2>
              <div className="space-y-4">
                <Input
                  label="Teacher Image URL (e.g. /teacher.jpg)"
                  value={content.teacher_image_url || ""}
                  onChange={(e) => handleChange("teacher_image_url", e.target.value)}
                  placeholder="e.g., /images/teacher.jpg or https://... "
                />
                <Input
                  label="Teacher Name"
                  value={content.teacher_name || ""}
                  onChange={(e) => handleChange("teacher_name", e.target.value)}
                  placeholder="e.g., Amal Viduranga"
                />
                <Textarea
                  label="Teacher Qualification"
                  value={content.teacher_qualification || ""}
                  onChange={(e) => handleChange("teacher_qualification", e.target.value)}
                  rows={3}
                  placeholder="e.g., BSc. (Hons) in Information Technology - University of Moratuwa"
                />
                <Textarea
                  label="Teacher Description (use new lines for bullet points)"
                  value={content.teacher_description || ""}
                  onChange={(e) => handleChange("teacher_description", e.target.value)}
                  rows={6}
                  placeholder="Each line will become a bullet point"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Subject Information</h2>
              <div className="space-y-4">
                <Input
                  label="Subject Name"
                  value={content.subject_name || ""}
                  onChange={(e) => handleChange("subject_name", e.target.value)}
                  placeholder="e.g., G.C.E. Advanced Level Mathematics"
                />
                <Input
                  label="Subject Code"
                  value={content.subject_code || ""}
                  onChange={(e) => handleChange("subject_code", e.target.value)}
                  placeholder="e.g., 07"
                />
                <Textarea
                  label="Subject Description (use new lines for bullet points)"
                  value={content.subject_description || ""}
                  onChange={(e) => handleChange("subject_description", e.target.value)}
                  rows={6}
                  placeholder="Each line will become a bullet point"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              Content saved successfully!
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      </form>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div className="bg-slate-50 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-indigo-700">{content.site_name || "Your Site Name"}</h3>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">{content.teacher_name || "Teacher Name"}</h4>
            <p className="text-sm text-slate-600 mt-1 italic">{content.teacher_qualification || "Qualification"}</p>
            {content.teacher_description && (
              <ul className="mt-2 space-y-1">
                {content.teacher_description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <li key={i} className="text-sm text-slate-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{line.trim()}</span>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">{content.subject_name || "Subject Name"}</h4>
            <p className="text-sm text-indigo-600 font-medium">Code: {content.subject_code || "-"}</p>
            {content.subject_description && (
              <ul className="mt-2 space-y-1">
                {content.subject_description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <li key={i} className="text-sm text-slate-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{line.trim()}</span>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
