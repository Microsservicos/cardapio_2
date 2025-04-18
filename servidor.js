// servidor.js com MySQL e tratamento de erros aprimorado
const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");
const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Conexão com o banco MySQL (Railway ou outro)
const dbConfig = {
  host: "switchback.proxy.rlwy.net",
  user: "root",
  password: "XGHNbPlETOYsCGhxymjHVeJmVaTZdtiZ",
  database: "railway",
  port: 54582
};

let db;
(async () => {
  db = await mysql.createConnection(dbConfig);
})();

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// CATEGORIAS

app.post("/categorias", async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome da categoria é obrigatório." });

    const [rows] = await db.execute("SELECT * FROM categorias WHERE nome = ?", [nome]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Categoria já existe!" });
    }

    await db.execute("INSERT INTO categorias (nome) VALUES (?)", [nome]);
    res.json({ message: "Categoria cadastrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar categoria:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.get("/categorias", async (req, res) => {
  try {
    const [categorias] = await db.execute("SELECT * FROM categorias");
    res.json(categorias);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro interno ao listar categorias." });
  }
});

app.delete("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM categorias WHERE id = ?", [id]);
    res.json({ message: "Categoria excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir categoria:", err);
    res.status(500).json({ error: "Erro interno ao excluir categoria." });
  }
});

// PRATOS

app.post("/pratos", async (req, res) => {
  try {
    const { nome, preco, categoriaId, restaurant_id } = req.body;
    const categoriaIdNum = parseInt(categoriaId, 10);

    if (!nome || !preco || !categoriaId || !restaurant_id) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    const [catRows] = await db.execute("SELECT nome FROM categorias WHERE id = ?", [categoriaIdNum]);
    if (catRows.length === 0) {
      return res.status(400).json({ error: "Categoria não encontrada." });
    }

    const categoriaNome = catRows[0].nome;

    await db.execute(
      "INSERT INTO pratos (nome, preco, categoriaId, categoria, restaurant_id) VALUES (?, ?, ?, ?, ?)",
      [nome, preco, categoriaIdNum, categoriaNome, restaurant_id]
    );

    res.json({ message: "Prato cadastrado com sucesso!" });

  } catch (err) {
    console.error("Erro ao cadastrar prato:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.get("/pratos", async (req, res) => {
  try {
    const [pratos] = await db.execute("SELECT * FROM pratos");
    res.json(pratos);
  } catch (err) {
    console.error("Erro ao listar pratos:", err);
    res.status(500).json({ error: "Erro interno ao listar pratos." });
  }
});

app.delete("/pratos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM pratos WHERE id = ?", [id]);
    res.json({ message: "Prato excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir prato:", err);
    res.status(500).json({ error: "Erro interno ao excluir prato." });
  }
});

app.put("/pratos/:id/preco", async (req, res) => {
  try {
    const { id } = req.params;
    const { preco } = req.body;
    await db.execute("UPDATE pratos SET preco = ? WHERE id = ?", [preco, id]);
    res.json({ message: "Preço atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar preço:", err);
    res.status(500).json({ error: "Erro interno ao atualizar preço." });
  }
});

// Inicialização do servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000!"));


