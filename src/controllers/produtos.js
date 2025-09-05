import { pool } from "../database.js";

export const createProduto = async(req, res) => {
  try {
    const { nome, valor, imagem } = req.body;
    const result = await pool.query(
      "INSERT INTO produtos (nome, valor, imagem) VALUES ($1, $2, $3) RETURNING *",
      [nome, valor, imagem]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const readProdutos = async(req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const readProdutoById = async(req, res) => {
 try {
    const result = await pool.query("SELECT * FROM produtos WHERE id = $1", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const updateProduto = async(req, res) => {
 try {
    const { nome, valor, imagem } = req.body;
    const result = await pool.query(
      "UPDATE produtos SET nome=$1, valor=$2, imagem=$3 WHERE id=$4 RETURNING *",
      [nome, valor, imagem, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const deleteProduto = async(req, res) => {
 try {
    await pool.query("DELETE FROM produtos WHERE id = $1", [req.params.id]);
    res.send("Produto deletado com sucesso");
  } catch (err) {
    res.status(500).send(err.message);
  }
}
