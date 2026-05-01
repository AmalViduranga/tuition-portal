"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, Input, Textarea } from "@/components/ui";
import { Trash2, CheckCircle, XCircle } from "lucide-react";

interface Promotion {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  is_active: boolean;
  target_url: string;
  created_at: string;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("/contact");
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Upload image to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("promotions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("promotions")
        .getPublicUrl(filePath);

      // 3. Get admin profile ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 4. Insert into database
      const { error: insertError } = await supabase
        .from("promotions")
        .insert({
          title: title || null,
          description: description || null,
          image_url: publicUrl,
          target_url: targetUrl || "/contact",
          is_active: isActive,
          created_by: user.id
        });

      if (insertError) throw insertError;

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setTargetUrl("/contact");
      setIsActive(true);
      
      // Refresh list
      fetchPromotions();
    } catch (err: any) {
      setError(err.message || "Failed to create promotion");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchPromotions();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  const deletePromotion = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    
    try {
      // Delete from DB first
      const { error: dbError } = await supabase
        .from("promotions")
        .delete()
        .eq("id", id);
      
      if (dbError) throw dbError;

      // Try to extract path from URL and delete from storage
      const urlParts = imageUrl.split("/promotions/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("promotions").remove([filePath]);
      }

      fetchPromotions();
    } catch (err: any) {
      setError(err.message || "Failed to delete promotion");
    }
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
        <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
        <p className="text-sm text-slate-600 mt-1">Manage promotional popups shown to students</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Create New Promotion</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  required
                />
              </div>

              <Input
                label="Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Special Offer!"
              />

              <Input
                label="Target URL"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="e.g., /contact or https://..."
              />

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Set as Active Immediately
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Brief description to show under the image"
              />
              
              {file && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                  <div className="relative h-40 w-full rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}>
              Upload Promotion
            </Button>
          </div>
        </Card>
      </form>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Existing Promotions</h2>
        {promotions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No promotions found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <div key={promo.id} className="border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-white">
                <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={promo.image_url}
                    alt={promo.title || "Promotion"}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleStatus(promo.id, promo.is_active)}
                      className={`p-1.5 rounded-full ${promo.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'} hover:opacity-80 transition-opacity`}
                      title={promo.is_active ? "Deactivate" : "Activate"}
                    >
                      {promo.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deletePromotion(promo.id, promo.image_url)}
                      className="p-1.5 rounded-full bg-red-500 text-white hover:opacity-80 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {promo.is_active && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ACTIVE
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-900 truncate">{promo.title || "Untitled"}</h3>
                  {promo.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{promo.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-auto pt-2">
                    {new Date(promo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
