import { useState } from "react";
import { useRouter } from "next/router";
import { useDocsStore } from "../../../store/docStore";

type DocData = any;
export default function DocPage() {
  const router = useRouter();
  const { slug } = router.query;

  const lastOpened = useDocsStore((state: any) => state.lastOpened);
  const docName = lastOpened?.name || (Array.isArray(slug) ? slug[0] : slug);
  const docData = lastOpened?.data || null;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const ask = async () => {
    if (!question) return;
    setAsking(true);
    setAskError(null);
    try {
      const res = await fetch(
        `http://localhost:3003/query?q=${encodeURIComponent(question)}`
      );
      if (!res.ok) throw new Error(`Query failed: ${res.statusText}`);
      const json = await res.json();
      setAnswer(json.answer);
    } catch (err: any) {
      setAskError(err.message || "Unknown error");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Document: {docName}</h2>
      <div className="flex items-center space-x-2 mb-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Ask a question..."
          disabled={asking}
        />
        <button
          onClick={ask}
          disabled={!question || asking}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {asking ? "Asking..." : "Ask"}
        </button>
      </div>

      {askError && <div className="text-red-600 mb-4">Error: {askError}</div>}

      {answer && (
        <div className="mt-4">
          <strong>Answer:</strong> {answer}
        </div>
      )}

      {docData && (
        <div className="mb-4 border p-4 rounded">
          <h3 className="font-medium mb-2">Structured Data</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {JSON.stringify(docData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
