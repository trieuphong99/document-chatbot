import { useState } from "react";
import { useRouter } from "next/router";
import { useDocsStore } from "../../store/docStore";

type DocData = any;

type StoredDoc = { name: string; data: DocData };

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const files = useDocsStore((state: any) => state.files);
  const addFile = useDocsStore((state: any) => state.addFile);
  const setLastOpened = useDocsStore((state: any) => state.setLastOpened);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:3003/upload/", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const json = await res.json();
      const newDoc = { name: file.name, data: json };
      addFile(newDoc);
      setFile(null);
      alert("Upload successful!");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const openDoc = async (doc: StoredDoc) => {
    setLastOpened(doc);
    try {
      await fetch("http://localhost:3003/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: doc.name,
          score: 1.0, // highest priority
        }),
      });
    } catch (e) {
      console.error("Failed to set priority:", e);
    }
    router.push(`/docs/${encodeURIComponent(doc.name)}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
          disabled={loading}
        />
        <button
          onClick={upload}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Uploaded Files</h3>
        {files.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {files.map((f: any, idx: number) => (
              <li key={idx}>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => openDoc(f)}
                >
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
