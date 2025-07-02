import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();

  const upload = async () => {
    const form = new FormData();
    form.append("file", file!);
    const res = await fetch("http://localhost:3003/upload", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    alert("Uploaded: " + json.filename);
  };

  return (
    <div>
      <h2>Upload Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}
