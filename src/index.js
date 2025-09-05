    const cors = require('cors');
import { express } from "express";
import { createPedido, deletePedido, readPedidos } from "./controllers/pedidos.js";
import { createProduto, deleteProduto, readProdutoById, readProdutos, updateProduto } from "./controllers/produtos.js";
import { pool } from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

// =============================
// Criar tabelas (rodar uma vez)
// =============================
app.get("/init", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        valor NUMERIC(10,2) NOT NULL,
        imagem TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        data TIMESTAMP DEFAULT NOW(),
        nome_cliente VARCHAR(100) NOT NULL,
        telefone VARCHAR(20),
        cep VARCHAR(15),
        rua VARCHAR(100),
        bairro VARCHAR(100),
        numero VARCHAR(10),
        cidade VARCHAR(100),
        complemento VARCHAR(200)
    );

    CREATE TABLE IF NOT EXISTS produtos_pedidos (
        id SERIAL PRIMARY KEY,
        id_pedido INT REFERENCES pedidos(id) ON DELETE CASCADE,
        id_produto INT REFERENCES produtos(id) ON DELETE CASCADE,
        quantidade INT NOT NULL,
        CONSTRAINT unique_pedido_produto UNIQUE (id_pedido, id_produto)
    );

    
    CREATE INDEX IF NOT EXISTS idx_produtos_pedidos_pedido ON produtos_pedidos (id_pedido);
    CREATE INDEX IF NOT EXISTS idx_produtos_pedidos_produto ON produtos_pedidos (id_produto);

    `);
    res.send("Tabelas criadas com sucesso");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/produtos", createProduto);
app.get("/produtos", readProdutos);
app.get("/produtos/:id", readProdutoById);
app.put("/produtos/:id", updateProduto);
app.delete("/produtos/:id", deleteProduto);

app.post("/pedidos", createPedido);
app.get("/pedidos", readPedidos);
app.get("/pedidos/:id", readProdutoById);
app.delete("/pedidos/:id", deletePedido);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
