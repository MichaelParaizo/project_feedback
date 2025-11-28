import { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";

// 👉 Funções da API
const API_BASE = "http://localhost:8080/admin";

async function getFeedbackPage(page, size) {
  const res = await fetch(`${API_BASE}/feedbacks?page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Erro ao carregar feedbacks");
  return res.json();
}

async function getFeedbackById(id) {
  const res = await fetch(`${API_BASE}/feedbacks/${id}`);
  if (!res.ok) throw new Error("Erro ao carregar detalhes");
  return res.json();
}

export default function FeedbackTable() {

  // ✔ Paginação
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ✔ Dados
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✔ Busca / filtros
  const [busca, setBusca] = useState("");

  // ✔ Modal de detalhes
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhe, setDetalhe] = useState(null);

  async function carregarFeedbacks() {
    try {
      setLoading(true);
      const data = await getFeedbackPage(page, size);
      setLista(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarFeedbacks();
  }, [page]);

  async function abrirDetalhes(id) {
    const data = await getFeedbackById(id);
    setDetalhe(data);
    setModalOpen(true);
  }

  return (
    <div className="mt-10 bg-[#0e1525] p-6 rounded-xl shadow-lg text-white">

      {/* Título */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Feedbacks Completos</h2>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Buscar por nome, email..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-60 px-3 py-2 rounded bg-[#101a2f] border border-gray-600"
      />

      {/* Tabela */}
      <table className="w-full mt-4 text-sm">
        <thead className="text-gray-300 border-b border-gray-700">
          <tr>
            <th className="pb-2 text-left">Cliente</th>
            <th className="pb-2 text-left">Email</th>
            <th className="pb-2 text-left">WhatsApp</th>
            <th className="pb-2 text-left">Data</th>
            <th className="pb-2 text-left">Feedback</th>
            <th className="pb-2 text-left">Cupom</th>
            <th className="pb-2 text-left">Status</th>
            <th className="pb-2 text-center">Ação</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan="8" className="text-center py-6">Carregando...</td></tr>
          ) : lista.length === 0 ? (
            <tr><td colSpan="8" className="text-center py-6">Nenhum feedback encontrado</td></tr>
          ) : (
            lista
              .filter(f =>
                f.nome.toLowerCase().includes(busca.toLowerCase()) ||
                f.email.toLowerCase().includes(busca.toLowerCase())
              )
              .map((f) => (
                <tr key={f.id} className="border-b border-gray-800">
                  <td className="py-3">{f.nome}</td>
                  <td>{f.email}</td>
                  <td>{f.whatsapp}</td>
                  <td>{f.dataCriacao?.replace("T", " ")}</td>
                  <td className="max-w-xs truncate">{f.mensagemNegativa || "-"}</td>
                  <td>{f.cupom || "-"}</td>
                  <td>
                    {f.cupomValidado ? (
                      <span className="text-green-400">Validado</span>
                    ) : (
                      <span className="text-red-400">Não validado</span>
                    )}
                  </td>

                  {/* Ícone de ação */}
                  <td className="text-center">
                    <button
                      onClick={() => abrirDetalhes(f.id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <AiOutlineEye size={20} />
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
        >
          Anterior
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded ${
              page === i ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
        >
          Próxima
        </button>
      </div>

      {/* Modal */}
      {modalOpen && detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-[#0f1a2f] p-6 rounded-xl w-[450px] text-white shadow-xl">

            <h3 className="text-lg font-semibold mb-3">Detalhes do Feedback</h3>

            <p><b>Nome:</b> {detalhe.nome}</p>
            <p><b>Email:</b> {detalhe.email}</p>
            <p><b>WhatsApp:</b> {detalhe.whatsapp}</p>
            <p><b>Data:</b> {detalhe.dataCriacao?.replace("T", " ")}</p>
            <p><b>Item consumido:</b> {detalhe.itemConsumido || "-"}</p>
            <p><b>Feedback:</b> {detalhe.mensagemNegativa || "-"}</p>
            <p><b>Cupom:</b> {detalhe.cupom}</p>
            <p><b>Status:</b> {detalhe.cupomValidado ? "Validado" : "Não validado"}</p>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
