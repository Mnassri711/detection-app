const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(cors());

// stocke le fichier uploadé en mémoire, pas sur le disque
const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_SERVICE_URL = "http://127.0.0.1:8000/predict";

app.get("/", (req, res) => {
  res.json({ status: "Backend actif" });
});

app.post("/api/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image envoyée" });
    }

    // reconstitue un formulaire pour l'envoyer au service Python
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname });

    const response = await axios.post(PYTHON_SERVICE_URL, form, {
      headers: form.getHeaders(),
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur lors de la prédiction" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend lancé sur http://127.0.0.1:${PORT}`));