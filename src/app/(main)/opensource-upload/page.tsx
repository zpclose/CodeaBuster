"use client";
import { useState } from "react";

export default function OpenSourceUpload() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", file);

    try {
      // Catbox mengembalikan link langsung sebagai teks mentah
      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const url = await response.text();

      // Validasi URL sederhana
      if (!url.startsWith('http')) {
        throw new Error(`Invalid response from server: ${url}`);
      }

      setLink(url);
    } catch (err: any) {
      console.error("Gagal mengunggah ke Catbox:", err);
      alert(`Gagal mengunggah ke Catbox: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-center max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Open Source Upload (Catbox)</h1>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input 
          type="file" 
          onChange={handleUpload} 
          disabled={loading} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {loading && <p className="mt-4 text-gray-600 animate-pulse">Mengunggah file...</p>}
      </div>
      
      {link && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">Berhasil! Ini link permanen Anda:</p>
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}