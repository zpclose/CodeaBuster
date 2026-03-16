"use client";
import { useState } from "react";

export default function AnonymousUpload() {
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("idle");

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Menggunakan file.io (Gratis, No API Key, No Login)
      const res = await fetch("https://file.io", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setLink(data.link);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Foto Jadi Link</h1>
      
      <input 
        type="file" 
        onChange={uploadFile} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {status === "uploading" && <p className="mt-4 text-orange-500 italic">Sedang memproses...</p>}
      
      {link && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">Berhasil! Ini link Anda:</p>
          <a href={link} target="_blank" className="text-blue-600 underline break-all">
            {link}
          </a>
          <p className="text-[10px] text-gray-500 mt-2">*Catatan: Link file.io biasanya hanya bisa diunduh 1x atau bertahan terbatas.</p>
        </div>
      )}
    </div>
  );
}