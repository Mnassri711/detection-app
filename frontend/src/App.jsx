import { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function handlePredict() {
    if (!image) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur du serveur");
      const data = await res.json();
      setResult(data.detections);
    } catch (err) {
      setError("La prédiction a échoué. Vérifiez que les serveurs tournent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Détection d'objets</h1>
      <p className="subtitle">Chat, souris ou grenade ?</p>

      <label className="upload-box">
        {preview ? (
          <img src={preview} alt="aperçu" className="preview" />
        ) : (
          <span>Cliquez pour choisir une image</span>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
      </label>

      <button onClick={handlePredict} disabled={!image || loading}>
        {loading ? "Analyse en cours..." : "Prédire"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="results">
          {result.length === 0 ? (
            <p>Aucun objet détecté.</p>
          ) : (
            result.map((det, i) => (
              <div key={i} className="result-card">
                <span className="class-name">{det.className}</span>
                <span className="confidence">{Math.round(det.confidence * 100)}%</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;