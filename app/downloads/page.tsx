"use client";

import { useEffect, useState } from "react";
import { supabase, Brochure } from "@/lib/supabase";
import { Download, FileText, Loader2, ArrowRight } from "lucide-react";
import { motion } from "@/lib/motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DownloadsPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrochures() {
      try {
        const { data } = await supabase
          .from("brochures")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (data) setBrochures(data);
      } catch (error) {
        console.error("Error fetching brochures:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrochures();
  }, []);

  const handleDownload = async (brochure: Brochure) => {
    try {
      // 1. Open the file
      window.open(brochure.file_url, "_blank");

      // 2. Increment download count in background
      await supabase.rpc("increment_brochure_download", {
        row_id: brochure.id,
      });
      // Fallback update if RPC doesn't exist yet
      const { data } = await supabase
        .from("brochures")
        .select("download_count")
        .eq("id", brochure.id)
        .single();

      if (data) {
        await supabase
          .from("brochures")
          .update({ download_count: (data.download_count || 0) + 1 })
          .eq("id", brochure.id);
      }
    } catch (error) {
      console.error("Error handling download:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundImage: 'linear-gradient(to right, #2563eb, #1e40af)' }}>
              Downloads & Resources
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access and download our latest brochures, property guides, and
              market insights to help you make informed decisions.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 animate-pulse">Loading resources...</p>
            </div>
          ) : brochures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brochures.map((brochure, index) => (
                <motion.div
                  key={brochure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full"
                >
                  <div className="p-8 flex-grow">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-7 h-7" />
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                        PDF
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {brochure.title}
                    </h3>
                    <p className="text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                      {brochure.description ||
                        "Download this document for detailed information and specifications."}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-auto pt-4 border-t border-gray-50">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {formatFileSize(brochure.file_size || 0)}
                        </span>
                        <span className="flex items-center gap-1.5 ml-auto">
                            <Download className="w-3.5 h-3.5" />
                            {brochure.download_count} downloads
                        </span>
                    </div>
                  </div>

                  <div className="bg-gray-50/80 px-8 py-4 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleDownload(brochure)}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors"
                    >
                      Download Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No downloads available
              </h3>
              <p className="text-gray-500">
                Check back soon for new resources and guides.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
