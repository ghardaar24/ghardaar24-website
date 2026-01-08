"use client";

import { useState, useEffect, useRef } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { Brochure } from "@/lib/supabase";
import {
  Download,
  Upload,
  Trash2,
  FileText,
  Loader2,
  Plus,
  MoreVertical,
  X,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import Image from "next/image";

export default function DownloadsPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrochures();
  }, []);

  const fetchBrochures = async () => {
    try {
      const { data, error } = await supabase
        .from("brochures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBrochures(data || []);
    } catch (error) {
      console.error("Error fetching brochures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError("File size must be less than 10MB");
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name.replace(".pdf", ""));
      setUploadError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // 1. Upload file to storage
      const fileName = `${Date.now()}-${uploadFile.name.replace(/\s+/g, "-")}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("company-brochures")
        .upload(fileName, uploadFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("company-brochures")
        .getPublicUrl(fileName);

      // 3. Insert record into database
      const { error: dbError } = await supabase.from("brochures").insert({
        title: uploadTitle,
        description: uploadDescription,
        file_url: publicUrl,
        file_name: uploadFile.name,
        file_size: uploadFile.size,
        is_active: true,
      });

      if (dbError) throw dbError;

      // Reset and refresh
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      fetchBrochures();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload brochure");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (brochure: Brochure) => {
    try {
      const { error } = await supabase
        .from("brochures")
        .update({ is_active: !brochure.is_active })
        .eq("id", brochure.id);

      if (error) throw error;
      
      setBrochures(brochures.map(b => 
        b.id === brochure.id ? { ...b, is_active: !b.is_active } : b
      ));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (brochure: Brochure) => {
    if (!window.confirm("Are you sure you want to delete this brochure?")) return;

    try {
      // 1. Delete from storage (need to extract path from URL)
      // URL format: .../storage/v1/object/public/company-brochures/filename
      const path = brochure.file_url.split("/company-brochures/")[1];
      if (path) {
        await supabase.storage.from("company-brochures").remove([path]);
      }

      // 2. Delete from database
      const { error } = await supabase
        .from("brochures")
        .delete()
        .eq("id", brochure.id);

      if (error) throw error;

      setBrochures(brochures.filter(b => b.id !== brochure.id));
    } catch (err) {
      console.error("Error deleting brochure:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Downloads & Brochures</h1>
          <p className="text-gray-500 mt-1">Manage downloadable resources and guides for your users</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Brochure
        </motion.button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500 animate-pulse">Loading resources...</p>
        </div>
      ) : brochures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brochures.map((brochure) => (
            <motion.div
              layout
              key={brochure.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(brochure)}
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md transition-colors ${
                        brochure.is_active
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-gray-50 text-gray-500 border border-gray-100"
                      }`}
                    >
                      {brochure.is_active ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1 truncate" title={brochure.title}>
                  {brochure.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] mb-4">
                  {brochure.description || "No description provided"}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 pt-4 border-t border-gray-50">
                  <span className="flex items-center gap-1">
                     <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{formatFileSize(brochure.file_size || 0)}</span>
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Download className="w-3 h-3" />
                    {brochure.download_count}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50/50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                <a
                  href={brochure.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </a>
                <button
                  onClick={() => handleDelete(brochure)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center px-4"
        >
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
            <Download className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No brochures uploaded</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Upload brochures, pamphlets, or catalogs here. They will automatically appear in the footer for download.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload First Brochure
          </button>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upload Brochure</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Add a new resource for your users</p>
                </div>
                <button
                  onClick={() => !isUploading && setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {uploadError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{uploadError}</p>
                  </motion.div>
                )}
                
                {/* File Drop Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    uploadFile 
                      ? "border-blue-500 bg-blue-50/50" 
                      : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileSelect}
                  />
                  
                  {uploadFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-red-500 mb-3 relative">
                        <FileText className="w-7 h-7" />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatFileSize(uploadFile.size)}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFile(null);
                        }}
                        className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center min-h-[120px] justify-center">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-7 h-7" />
                      </div>
                      <p className="font-semibold text-gray-900">Click to upload PDF</p>
                      <p className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brochure Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="e.g., Annual Property Guide 2024"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="font-normal text-gray-400">(Optional)</span></label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none min-h-[100px] resize-none"
                      placeholder="Brief description of what's inside..."
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadTitle || isUploading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upload Brochure
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
