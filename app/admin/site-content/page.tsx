"use client";

import { useState, useEffect } from "react";
import { updateSiteContent } from "@/app/admin/actions";
import { Card, Button, Input, Textarea } from "@/components/ui";

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Current Class Lessons / Topics (Live on Homepage & Portal)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update the active lesson/topic currently being taught for each batch. Supports English and Sinhala text freely.
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  label="2027 Theory Class - Current Lesson"
                  value={content.current_lesson_2027_theory || ""}
                  onChange={(e) => handleChange("current_lesson_2027_theory", e.target.value)}
                  placeholder="e.g., Limits and Continuity or අනුකලනයේ මූලික සංකල්ප"
                  helperText="Displayed on homepage and student portal"
                />
                <Input
                  label="2027 Revision Class - Current Lesson"
                  value={content.current_lesson_2027_revision || ""}
                  onChange={(e) => handleChange("current_lesson_2027_revision", e.target.value)}
                  placeholder="e.g., Past Paper Discussion - 2025 or පසුගිය විභාග ප්‍රශ්න සාකච්ඡාව"
                  helperText="Displayed on homepage and student portal"
                />
                <Input
                  label="2028 Theory Class - Current Lesson"
                  value={content.current_lesson_2028_theory || ""}
                  onChange={(e) => handleChange("current_lesson_2028_theory", e.target.value)}
                  placeholder="e.g., Functions Introduction or ශ්‍රිත හැඳින්වීම"
                  helperText="Displayed on homepage and student portal"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 font-medium">
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
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Live Content Preview</h2>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-6 border border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{content.site_name || "Your Site Name"}</h3>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Current Active Lessons</h4>
            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white block">2027 Theory:</span>
                <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{content.current_lesson_2027_theory || "Not set yet"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white block">2027 Revision:</span>
                <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{content.current_lesson_2027_revision || "Not set yet"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-900 dark:text-white block">2028 Theory:</span>
                <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{content.current_lesson_2028_theory || "Not set yet"}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{content.teacher_name || "Teacher Name"}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">{content.teacher_qualification || "Qualification"}</p>
            {content.teacher_description && (
              <ul className="mt-2 space-y-1">
                {content.teacher_description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{line.trim()}</span>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{content.subject_name || "Subject Name"}</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Code: {content.subject_code || "-"}</p>
            {content.subject_description && (
              <ul className="mt-2 space-y-1">
                {content.subject_description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
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
