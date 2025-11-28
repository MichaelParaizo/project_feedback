import { useEffect, useState, useMemo } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { useAuth } from "../../context/AuthContext";
import {
  getDashboard,
  getFeedbacks,
  getHorariosCriticos,
  validarCupomDoFeedback,
} from "../../api/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE = "http://localhost:8080/admin";
const PAGE_SIZE = 20;

// ----------------- helpers -----------------
function formatarDataHoraBr(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatPercent(value) {
  if (typeof value !== "number") return "0%";
  return `${Math.round(value)}%`;
}


// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================
export default function Dashboard() {
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [horariosCriticos, setHorariosCriticos] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // filtros da tabela
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(""); // POSITIVO | NEGATIVO
  const [filtroValidado, setFiltroValidado] = useState(""); // true | false

  // paginação
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // modal detalhe
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [detalheErro, setDetalheErro] = useState(null);
  const [detalhe, setDetalhe] = useState(null);

  // ─────────────────────────────
  // Carregar dashboard + horários + feedbacks
  // ─────────────────────────────
  useEffect(() => {
    if (!token) return;

    async function carregarTudo() {
      try {
        setLoading(true);
        setErro(null);

        const [dash, horarios, tabela] = await Promise.all([
          getDashboard(token),
          getHorariosCriticos(token),
          getFeedbacks(token, { page: 0, size: PAGE_SIZE }),
        ]);

        setDadosDashboard(dash);
        setHorariosCriticos(horarios || []);

        const pageContent = tabela?.content || tabela || [];
        setFeedbacks(pageContent);
        setPaginaAtual(tabela?.number ?? 0);
        setTotalPaginas(tabela?.totalPages ?? 1);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar informações do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    carregarTudo();
  }, [token]);

// ─────────────────────────────
// Recarregar feedbacks (filtros / paginação)
// ─────────────────────────────
async function carregarFeedbacks(page = 0) {
  if (!token) return;

  try {
    setLoading(true);
    setErro(null);

    const params = {
      page,
      size: PAGE_SIZE,
    };

    // Filtros que o BACKEND realmente entende bem
    if (filtroTipo) params.tipo = filtroTipo;
    if (filtroValidado) params.validado = filtroValidado;

    const tabela = await getFeedbacks(token, params);
    const pageContent = tabela?.content || tabela || [];

    // Filtro de texto (nome / email / cupom) feito NO FRONT
    let filtrados = pageContent;
    const termo = busca.trim().toLowerCase();

    if (termo) {
      filtrados = pageContent.filter((f) => {
        const nome = (f.nome || "").toLowerCase();
        const email = (f.email || "").toLowerCase();
        const cupom = (f.cupom || f.cupomCodigo || "").toLowerCase();

        return (
          nome.includes(termo) ||
          email.includes(termo) ||
          cupom.includes(termo)
        );
      });
    }

    setFeedbacks(filtrados);
    setPaginaAtual(tabela?.number ?? page);
    setTotalPaginas(tabela?.totalPages ?? 1);
  } catch (e) {
    console.error(e);
    setErro("Erro ao carregar feedbacks.");
  } finally {
    setLoading(false);
  }
}


  // ─────────────────────────────
  // Abrir popup de detalhe
  // ─────────────────────────────
  async function abrirDetalhe(feedbackId) {
    if (!feedbackId || !token) return;

    try {
      setDetalheErro(null);
      setDetalheLoading(true);

      const res = await fetch(`${API_BASE}/feedbacks/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Erro ao buscar feedback (${res.status})`);
      }

      const data = await res.json();
      setDetalhe(data);
      setDetalheAberto(true);
    } catch (e) {
      console.error(e);
      setDetalhe(null);
      setDetalheErro("Não foi possível carregar o detalhe do feedback.");
      setDetalheAberto(true);
    } finally {
      setDetalheLoading(false);
    }
  }

  function fecharDetalhe() {
    setDetalheAberto(false);
    setDetalhe(null);
    setDetalheErro(null);
  }

  // ─────────────────────────────
  // Filtros da tabela
  // ─────────────────────────────
  async function aplicarFiltros(e) {
    e.preventDefault();
    await carregarFeedbacks(0);
  }

  // ─────────────────────────────
  // Validar cupom do feedback
  // ─────────────────────────────
  async function handleValidarCupom(id) {
    if (!token || !id) return;

    try {
      await validarCupomDoFeedback(token, id);

      // Atualiza só o item validado
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, cupomValidado: true } : f
        )
      );
    } catch (e) {
      console.error(e);
      setErro("Erro ao validar cupom.");
    }
  }

  // ─────────────────────────────
  // Dados derivados do dashboard
  // ─────────────────────────────
  const metricas = dadosDashboard?.metricasGerais || {};
  const cupons = dadosDashboard?.cupons || {};
  const sentimentos = dadosDashboard?.sentimentos || {};
  const timeline = dadosDashboard?.timeline || [];
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());


 // labels + séries para o gráfico de barras neon
// --- GRÁFICO DE BARRAS --- //
const graficoLinhaData = useMemo(() => {
  const mesesPadrao = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  // Reset mensal
  const feedbackSeries = Array(12).fill(0);
  const cuponsSeries = Array(12).fill(0);

  if (timeline && timeline.feedbacks) {
    timeline.feedbacks.forEach(item => {
      const data = new Date(item.dia);
      if (data.getFullYear() === anoSelecionado) {
        const mes = data.getMonth();
        feedbackSeries[mes] += item.quantidade;
      }
    });
  }

  if (timeline && timeline.cupons) {
    timeline.cupons.forEach(item => {
      const data = new Date(item.dia);
      if (data.getFullYear() === anoSelecionado) {
        const mes = data.getMonth();
        cuponsSeries[mes] += item.quantidade;
      }
    });
  }

  // GRADIENTES NEON
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const gradientFeedback = ctx.createLinearGradient(0, 0, 0, 400);
  gradientFeedback.addColorStop(0, "#5ee7ff");
  gradientFeedback.addColorStop(1, "#0284c7");

  const gradientCupons = ctx.createLinearGradient(0, 0, 0, 400);
  gradientCupons.addColorStop(0, "#4ade80");
  gradientCupons.addColorStop(1, "#15803d");

  return {
    labels: mesesPadrao,
    datasets: [
      {
        label: "Feedbacks",
        data: feedbackSeries,
        backgroundColor: gradientFeedback,
        borderWidth: 0,
        barThickness: 10,
        borderRadius: 4,
      },
      {
        label: "Cupons",
        data: cuponsSeries,
        backgroundColor: gradientCupons,
        borderWidth: 0,
        barThickness: 10,
        borderRadius: 4,
      }
    ]
  };
}, [timeline, anoSelecionado]);


  // dados gráfico donut de sentimentos
  const graficoDonutData = useMemo(() => {
    const positivos =
      sentimentos.positivosPercent ??
      sentimentos.percentualPositivos ??
      metricas.positivosPercent ??
      0;

    const negativos =
      sentimentos.negativosPercent ??
      sentimentos.percentualNegativos ??
      metricas.negativosPercent ??
      0;

    const restante = Math.max(0, 100 - (positivos + negativos));

    return {
      labels: ["Positivos", "Negativos", "Neutros"],
      datasets: [
        {
          data: [positivos, negativos, restante],
          backgroundColor: [
            "rgba(34,197,94,0.8)",
            "rgba(239,68,68,0.8)",
            "rgba(148,163,184,0.8)",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [sentimentos, metricas]);

  if (loading && !dadosDashboard) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        Carregando Dashboard...
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050816] via-[#020617] to-black text-white px-10 py-8">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Review </span>
            <span className="text-indigo-400">Prime AI</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Painel de Gestão de Feedbacks de Clientes
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10">
            ⚙ Configurações
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-red-500/90 text-sm font-medium hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      {erro && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-lg">
          {erro}
        </div>
      )}

      {/* 1ª LINHA - CARDS PRINCIPAIS */}
      <section className="grid grid-cols-6 gap-4 mb-8">
        <KpiCard
          titulo="Total de Feedbacks"
          valor={metricas.totalFeedbacks ?? 0}
        />
        <KpiCard
          titulo="Feedbacks Positivos"
          valor={formatPercent(metricas.positivosPercent ?? 0)}
          destaque="up"
        />
        <KpiCard
          titulo="Feedbacks Negativos"
          valor={formatPercent(metricas.negativosPercent ?? 0)}
          destaque="down"
        />
        <KpiCard
          titulo="Cupons Solicitados"
          valor={cupons.cuponsSolicitados ?? 0}
        />
        <KpiCard
          titulo="Cupons Validados"
          valor={cupons.cuponsValidados ?? 0}
        />
        <KpiCard
          titulo="Novos Clientes Hoje"
          valor={metricas.novosClientesHoje ?? 0}
        />
      </section>

      {/* 2ª LINHA - GRÁFICO + CTA IA + DONUT */}
      <section className="grid grid-cols-3 gap-6 mb-10">
        {/* Gráfico linhas */}
        <div className="col-span-2 bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-5 shadow-xl">
          <h3 className="text-sm font-semibold mb-3">
            Feedbacks e Cupons ao Longo do Tempo
          </h3>
          <div className="flex items-center justify-center gap-4 text-gray-300 mb-3">

  <button
    onClick={() => setAnoSelecionado(prev => prev - 1)}
    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
  >
    ←
  </button>

  <span className="text-lg font-semibold tracking-wider">
    {anoSelecionado}
  </span>

  <button
    onClick={() => setAnoSelecionado(prev => prev + 1)}
    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
  >
    →
  </button>

</div>

          <div className="h-64">
            <Bar
              data={graficoLinhaData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: "#e5e7eb", boxWidth: 12 },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: "#9ca3af" },
                    grid: { display: false },
                  },
                  y: {
                    ticks: { color: "#9ca3af" },
                    grid: { color: "rgba(75,85,99,0.25)" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* CTA IA + Donut */}
        <div className="col-span-1 flex flex-col gap-4">
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl px-5 py-4 text-left shadow-lg shadow-purple-500/40">
            <p className="text-xs text-white/80">Campanhas inteligentes</p>
            <p className="text-sm font-semibold">
              ✨ Gerar E-mails Promocionais com IA
            </p>
            <p className="text-[11px] text-white/70 mt-1">
              Crie campanhas personalizadas automaticamente.
            </p>
          </button>

          <div className="bg-[#0b1120] border border-white/10 rounded-2xl px-5 py-4 shadow-xl flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-3 self-start">
              Distribuição de Sentimentos
            </h3>
            <div className="w-40 h-40 mb-2">
              <Doughnut
                data={graficoDonutData}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: "#e5e7eb", boxWidth: 10 },
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3ª LINHA - ASSISTENTE IA COMPLETO */}
      <section className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-6 mb-8 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-sky-400 text-xl">💡</span>
          Assistente Inteligente de Análise (IA)
        </h2>

        {/* 8 cards */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
          <IAcard
            cor="from-red-600/80 to-red-800/80"
            titulo="Resumo dos Feedbacks Negativos de Hoje"
            texto="Principais reclamações: atraso na entrega, produto etc."
          />
          <IAcard
            cor="from-emerald-600/80 to-emerald-800/80"
            titulo="Alerta de Tendência"
            texto="Aumento recente nas menções positivas nas últimas 48h."
          />
          <IAcard
            cor="from-sky-600/80 to-sky-800/80"
            titulo="Sugestões de Melhoria"
            texto="Pontos de atrito detectados em vários feedbacks."
          />
          <IAcard
            cor="from-purple-600/80 to-purple-800/80"
            titulo="Recomendações de Campanha"
            texto="Enviar promoção para clientes inativos."
          />
          <IAcard
            cor="from-cyan-600/80 to-cyan-800/80"
            titulo="Padrões Detectados"
            texto="Produtos que geram maior satisfação."
          />
          <IAcard
            cor="from-teal-600/80 to-teal-800/80"
            titulo="Previsão de Horário dos Clientes"
            texto="Identificação dos horários de maior movimento."
          />
          <IAcard
            cor="from-indigo-600/80 to-indigo-800/80"
            titulo="Análise Automática de Feedbacks"
            texto="A IA analisa textos e detecta padrões."
          />
          <IAcard
            cor="from-amber-600/80 to-amber-800/80"
            titulo="Ações Sugeridas pela IA"
            texto="Sugestões operacionais e estratégias."
          />
        </div>

        {/* Horário x Previsão */}
        <div className="grid grid-cols-2 gap-6">
          {/* Horário com mais reclamações */}
          <div className="bg-[#020617] border border-red-500/30 rounded-2xl px-5 py-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="text-red-400 text-lg">⏱</span>
              Horário com mais Reclamações
            </h3>

            {horariosCriticos?.length ? (
              <>
                <p className="text-3xl font-bold mt-3">
                  {horariosCriticos[0].horaInicio} -{" "}
                  {horariosCriticos[0].horaFim}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {horariosCriticos[0].totalReclamacoes} reclamações no período
                </p>

                <div className="mt-5">
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: "32%" }}
                    />
                  </div>
                  <p className="text-[11px] text-red-400 mt-1 text-right">
                    32%
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 mt-3">
                Sem dados de reclamações por horário.
              </p>
            )}
          </div>

          {/* Previsão de satisfação */}
          <div className="bg-[#020617] border border-emerald-500/30 rounded-2xl px-5 py-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="text-emerald-400 text-lg">📈</span>
              Previsão de Satisfação
            </h3>
              <p className="text-3xl font-bold mt-3">
  {Math.round(metricas.positivosPercent ?? 0)}%
</p>

<p className="text-xs text-emerald-400 mt-1">
  Índice de satisfação baseado nos últimos feedbacks
</p>

<div className="mt-5">
  <div className="w-full h-2 rounded-full bg-white/10">
    <div
      className="h-2 rounded-full bg-emerald-500"
      style={{
        width: `${Math.round(metricas.positivosPercent ?? 0)}%`,
      }}
    />
  </div>

  <p className="text-[11px] text-emerald-400 mt-1 text-right">
    {Math.round(metricas.positivosPercent ?? 0)}%
  </p>
</div>

          </div>
        </div>
      </section>

      {/* 4ª LINHA - TABELA DE FEEDBACKS */}
      <section className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-6 mb-16 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-sky-400 text-lg">💬</span>
            Feedbacks Completos
          </h2>

          <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium">
            🤖 Responder Feedback com IA
          </button>
        </div>

        {/* filtros */}
        <form
          onSubmit={aplicarFiltros}
          className="flex flex-wrap gap-3 mb-4 text-xs items-end"
        >
          <div className="flex flex-col">
            <label className="text-gray-400 mb-1">
              Buscar (nome / email / cupom)
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Digite um termo..."
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-400 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
            >
              <option value="">Todos</option>
              <option value="POSITIVO">Positivos</option>
              <option value="NEGATIVO">Negativos</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-400 mb-1">Cupom validado?</label>
            <select
              value={filtroValidado}
              onChange={(e) => setFiltroValidado(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
            >
              <option value="">Todos</option>
              <option value="true">Validados</option>
              <option value="false">Não validados</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-medium"
          >
            Aplicar
          </button>
        </form>

        {/* tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">WhatsApp</th>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3 w-[22%]">Feedback</th>
                <th className="py-2 pr-3">Cupom</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => {
                const nome = f.nome || f.nomeCliente || "-";

                // tipo vem do back, mas garantimos fallback:
                const tipo =
                  f.tipoFeedback || (f.mensagem ? "NEGATIVO" : "POSITIVO");
                const negativo = tipo === "NEGATIVO";
                const tipoTexto = negativo ? "Negativo" : "Positivo";

                const iniciais =
                  String(nome)
                    .trim()
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase() || "?";

                const textoFeedback = f.mensagem || "-";

                return (
                  <tr
                    key={f.id || `${f.email}-${f.data}`}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-[11px] font-semibold">
                          {iniciais}
                        </div>
                        <span className="text-sm text-gray-100">{nome}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      {f.email || f.emailCliente || "-"}
                    </td>
                    <td className="py-2 pr-3">
                      {f.whatsapp || f.telefone || "-"}
                    </td>
                    <td className="py-2 pr-3">
                      {formatarDataHoraBr(f.data || f.dataFeedback)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${
                          negativo
                            ? "bg-red-500/10 text-red-300 border-red-500/40"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {tipoTexto}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-200 max-w-xs truncate">
                      {textoFeedback}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex px-3 py-1 rounded-full text-[11px] bg-purple-700/30 border border-purple-500/40 text-purple-200">
                        {f.cupom || f.cupomCodigo || "-"}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => !f.cupomValidado && handleValidarCupom(f.id)}
                        disabled={f.cupomValidado}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                          f.cupomValidado
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50 cursor-default"
                            : "bg-slate-700 text-slate-100 border-slate-500 hover:bg-slate-600"
                        }`}
                      >
                        {f.cupomValidado ? "Validado" : "Validar"}
                      </button>
                    </td>
                    <td className="py-2 pr-3 text-center">
                      {f.id ? (
                        <button
                          type="button"
                          onClick={() => abrirDetalhe(f.id)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/40"
                          title="Ver detalhes"
                        >
                          👁
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}

              {!feedbacks.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-6 text-center text-gray-500 text-xs"
                  >
                    Nenhum feedback encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPaginas }).map((_, idx) => {
              const ativo = idx === paginaAtual;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => carregarFeedbacks(idx)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold border ${
                    ativo
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700/60"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL DETALHE */}
{detalheAberto && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative animate-fade-in">

      {/* Botão Fechar */}
      <button
        onClick={fecharDetalhe}
        className="absolute right-4 top-4 text-gray-400 hover:text-white text-xl"
      >
        ✕
      </button>

      {/* Título */}
      <h3 className="text-lg font-semibold mb-2 text-sky-300 flex items-center gap-2">
        📄 Detalhes do Feedback
      </h3>

      {/* Estados de loading/erro usando detalheLoading e detalheErro */}
      {detalheLoading && (
        <p className="text-xs text-gray-400 mb-2">
          Carregando detalhes...
        </p>
      )}

      {detalheErro && (
        <p className="text-xs text-red-400 mb-2">
          {detalheErro}
        </p>
      )}

      {/* Só mostra o conteúdo quando não estiver carregando e tiver detalhe */}
      {!detalheLoading && detalhe && (
        <div className="space-y-4">

          {/* Cliente + WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Cliente</p>
              <p className="text-sm font-semibold text-white">
                {detalhe.nome || detalhe.nomeCliente || "-"}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">WhatsApp</p>
              <p className="text-sm font-semibold">
                {detalhe.whatsapp || detalhe.telefone || "-"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Email</p>
            <p className="text-sm font-semibold break-all">
              {detalhe.email || detalhe.emailCliente || "-"}
            </p>
          </div>

          {/* Data + Nota */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Data</p>
              <p className="text-sm font-semibold">
                {formatarDataHoraBr(
                  detalhe.dataCriacao ||
                    detalhe.dataFeedback ||
                    detalhe.data
                )}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Nota</p>
              <p className="text-sm font-semibold">
                ⭐ {detalhe.nota ?? "-"}
              </p>
            </div>
          </div>

          {/* Feedback do Cliente (mantido grande) */}
          <div className="bg-white/5 border border-sky-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-300 mb-2 flex items-center gap-1">
              💬 Feedback do Cliente
            </p>
            <p className="text-gray-100 text-sm leading-relaxed">
              {detalhe.mensagemNegativa ||
                detalhe.mensagem ||
                detalhe.feedback ||
                "-"}
            </p>
          </div>

          {/* Cupom + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Cupom</p>
              <p className="text-sm font-semibold">
                {detalhe.cupomCodigo || detalhe.cupom || "-"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Status do Cupom</p>
              <p
                className={`text-sm font-semibold ${
                  detalhe.cupomValidado ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {detalhe.cupomValidado ? "Validado" : "Não validado"}
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={fecharDetalhe}
              className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-xs hover:bg-white/10"
            >
              Fechar
            </button>

            <button
              className="px-4 py-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-semibold hover:opacity-90 shadow flex items-center gap-2"
            >
              🤖 Gerar Resposta com IA
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================
function KpiCard({ titulo, valor, destaque }) {
  const cor =
    destaque === "up"
      ? "text-emerald-400"
      : destaque === "down"
      ? "text-red-400"
      : "text-white";

  return (
    <div className="bg-[#0b1120] border border-white/10 rounded-2xl px-5 py-4 shadow-lg flex flex-col justify-between">
      <p className="text-xs text-gray-400 mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
    </div>
  );
}

function IAcard({ cor, titulo, texto }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${cor} px-5 py-4 border border-white/10 shadow-md`}
    >
      <p className="text-sm font-semibold mb-1">{titulo}</p>
      <p className="text-xs text-gray-100/90">{texto}</p>
    </div>
  );
}
