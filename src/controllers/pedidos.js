import { pool } from "./database.js";
export const createPedido = async(req, res) => {
  try {
      const { nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos } = req.body;
      const result = await pool.query(
        `INSERT INTO pedidos 
        (nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, JSON.stringify(produtos)]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
}

export const readPedidos = async(req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pedidos ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const readPedidoById = async(req, res) => {
 try {
    const result = await pool.query("SELECT * FROM pedidos WHERE id = $1", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const deletePedido = async(req, res) => {
 try {
    await pool.query("DELETE FROM pedidos WHERE id = $1", [req.params.id]);
    res.send("Pedido deletado com sucesso");
  } catch (err) {
    res.status(500).send(err.message);
  }
}