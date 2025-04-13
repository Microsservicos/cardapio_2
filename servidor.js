// servidor.js com Firebase Firestore
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Init
const serviceAccount = require("./firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// CATEGORIAS

// Criar nova categoria (evita duplicatas)
app.post("/categorias", async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome da categoria é obrigatório." });

  const snapshot = await db.collection("categorias").where("nome", "==", nome).get();
  if (!snapshot.empty) {
    return res.status(400).json({ error: "Categoria já existe!" });
  }

  const docRef = await db.collection("categorias").add({ nome });
  res.json({ id: docRef.id, nome, message: "Categoria cadastrada com sucesso!" });
});

// Listar todas as categorias
app.get("/categorias", async (req, res) => {
  const snapshot = await db.collection("categorias").get();
  const categorias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(categorias);
});

// Excluir categoria
app.delete("/categorias/:id", async (req, res) => {
  const { id } = req.params;
  await db.collection("categorias").doc(id).delete();
  res.json({ message: "Categoria excluída com sucesso!" });
});

// PRATOS

// Criar prato associando a uma categoria existente
app.post("/pratos", async (req, res) => {
  const { nome, preco, categoriaId, restaurant_id } = req.body;
  if (!nome || !preco || !categoriaId || !restaurant_id) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
  }

  const categoriaDoc = await db.collection("categorias").doc(categoriaId).get();
  if (!categoriaDoc.exists) return res.status(400).json({ error: "Categoria não encontrada." });

  const categoriaNome = categoriaDoc.data().nome;

  const prato = {
    nome,
    preco: parseFloat(preco),
    categoria: categoriaNome,
    categoriaId,
    restaurant_id
  };

  const result = await db.collection("pratos").add(prato);
  res.json({ id: result.id, ...prato, message: "Prato cadastrado com sucesso!" });
});

// Listar todos os pratos
app.get("/pratos", async (req, res) => {
  const snapshot = await db.collection("pratos").get();
  const pratos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(pratos);
});

// Excluir prato
app.delete("/pratos/:id", async (req, res) => {
  const { id } = req.params;
  await db.collection("pratos").doc(id).delete();
  res.json({ message: "Prato excluído com sucesso!" });
});

// Atualizar preço do prato
app.put("/pratos/:id/preco", async (req, res) => {
  const { id } = req.params;
  const { preco } = req.body;
  await db.collection("pratos").doc(id).update({ preco: parseFloat(preco) });
  res.json({ message: "Preço atualizado com sucesso!" });
});

// Inicialização do servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000!"));
