import { pool } from "../database.js";
export const createPedido = async(req, res) => {
  // try {
  //     const { nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos } = req.body;
  //     const result = await pool.query(
  //       `INSERT INTO pedidos 
  //       (nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos) 
  //       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
  //       [nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, JSON.stringify(produtos)]
  //     );
  //     res.json(result.rows[0]);
  //   } catch (err) {
  //     res.status(500).send(err.message);
  //   }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos } = req.body

    // 1. Cria o pedido
    const result = await client.query(
      `INSERT INTO pedidos 
       (nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, data`,
      [nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento]
    )
    const pedidoId = result.rows[0].id

    // 2. Insere os produtos ligados ao pedido
    if (Array.isArray(produtos)) {
      for (const p of produtos) {
        await client.query(
          `INSERT INTO produtos_pedidos (id_pedido, id_produto, quantidade) 
           VALUES ($1,$2,$3)`,
          [pedidoId, p.id_produto, p.quantidade]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ id: pedidoId, data: result.rows[0].data, nome_cliente, telefone, cep, rua, bairro, numero, cidade, complemento, produtos })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).send(err.message)
  } finally {
    client.release()
  }
}

export const readPedidos = async(req, res) => {
  // try {
  //   const result = await pool.query("SELECT * FROM pedidos ORDER BY id DESC");
  //   res.json(result.rows);
  // } catch (err) {
  //   res.status(500).send(err.message);
  // }
  try {
    const result = await pool.query('SELECT * FROM pedidos ORDER BY id DESC')
    const pedidos = result.rows

    for (const pedido of pedidos) {
      const itensRes = await pool.query(
        `SELECT pp.id, pp.quantidade, pr.nome, pr.valor, pr.imagem, pr.id as id_produto
         FROM produtos_pedidos pp
         JOIN produtos pr ON pp.id_produto = pr.id
         WHERE pp.id_pedido = $1`,
        [pedido.id]
      )
      pedido.produtos = itensRes.rows
    }

    res.json(pedidos)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export const readPedidoById = async(req, res) => {
//  try {
//     const result = await pool.query("SELECT * FROM pedidos WHERE id = $1", [req.params.id]);
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
try {
    const pedidoRes = await pool.query('SELECT * FROM pedidos WHERE id = $1', [req.params.id])
    if (pedidoRes.rowCount === 0) return res.status(404).send('Pedido não encontrado')

    const pedido = pedidoRes.rows[0]

    const itensRes = await pool.query(
      `SELECT pp.id, pp.quantidade, pr.nome, pr.valor, pr.imagem, pr.id as id_produto
       FROM produtos_pedidos pp
       JOIN produtos pr ON pp.id_produto = pr.id
       WHERE pp.id_pedido = $1`,
      [pedido.id]
    )
    pedido.produtos = itensRes.rows

    res.json(pedido)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export const deletePedido = async(req, res) => {
//  try {
//     await pool.query("DELETE FROM pedidos WHERE id = $1", [req.params.id]);
//     res.send("Pedido deletado com sucesso");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
try {
    await pool.query('DELETE FROM pedidos WHERE id = $1', [req.params.id])
    res.sendStatus(204)
  } catch (err) {
    res.status(500).send(err.message)
  }
}