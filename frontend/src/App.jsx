import { useState } from "react";
import StarRating from "./components/StarRating";

export default function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [itemConsumido, setItemConsumido] = useState("");
  const [mensagemNegativa, setMensagemNegativa] = useState("");

  const [rating, setRating] = useState(0);
  const [lgpd, setLgpd] = useState(false);

  const [erro, setErro] = useState("");
  const [feedbackId, setFeedbackId] = useState(null);
  const [cupom, setCupom] = useState(null);

  const [mensagemAlta, setMensagemAlta] = useState("");
  const [linkGoogle, setLinkGoogle] = useState("");
  const [mostrarBotaoGoogle, setMostrarBotaoGoogle] = useState(false);
  const [mostrarBotaoGerarCupom, setMostrarBotaoGerarCupom] = useState(false);

  const API_URL = "http://localhost:8080/feedback";

  async function enviarFeedback() {
    setErro("");

    if (!nome.trim()) return setErro("Informe seu nome");
    if (!email.trim()) return setErro("Informe um e-mail válido");
    if (!whatsapp.trim()) return setErro("Informe o WhatsApp");
    if (!rating) return setErro("Selecione uma nota");
    if (!lgpd) return setErro("Você deve aceitar a LGPD para continuar");

    if (rating < 4 && mensagemNegativa.trim().length === 0) {
      return setErro("Conte brevemente o que aconteceu");
    }

    const payload = {
      nome,
      email,
      whatsapp,
      itemConsumido,
      nota: rating,
      consentimentoLgpd: lgpd,
      mensagemNegativa: rating < 4 ? mensagemNegativa : "",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar feedback");
      }

      const data = await response.json();
      setFeedbackId(data.id);

      if (data.tipo === "BAIXA") {
        setCupom(data.cupom);
        return;
      }

      if (data.tipo === "ALTA") {
        setMensagemAlta(data.mensagem);
        setLinkGoogle(data.linkGoogle);
        setMostrarBotaoGoogle(true);
      }
    } catch (error) {
      console.log(error);
      setErro("Falha ao conectar ao servidor.");
    }
  }

  async function gerarCupom() {
    if (!feedbackId) {
      return setErro("ID de feedback não encontrado.");
    }

    try {
      const response = await fetch(`${API_URL}/${feedbackId}/gerar-cupom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar cupom");
      }

      const data = await response.json();
      setCupom(data.cupom);
      setMensagemAlta("Seu cupom foi liberado! 🎉");
      setMostrarBotaoGerarCupom(false);
    } catch (error) {
      console.log(error);
      setErro("Erro ao gerar cupom. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start sm:items-center p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">

        {/* Título */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Seu Feedback</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Responda abaixo e receba seu cupom 🎁
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm sm:text-base">
            {erro}
          </div>
        )}

        {/* CUPOM FINAL */}
        {cupom && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold text-base sm:text-lg">
            🎉 Seu cupom é:<br />
            <span className="text-xl sm:text-2xl">{cupom}</span>
          </div>
        )}

        {/* MENSAGEM ALTA NOTA */}
        {mensagemAlta && !cupom && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-center text-blue-700 text-sm sm:text-base">
            {mensagemAlta}
          </div>
        )}

        {/* Botão Google */}
        {mostrarBotaoGoogle && (
          <button
            type="button"
            onClick={() => {
              window.open(linkGoogle, "_blank");
              setMostrarBotaoGerarCupom(true);
              setMostrarBotaoGoogle(false);
            }}
            className="w-full bg-yellow-600 text-white py-3 sm:py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
          >
            Fazer avaliação no Google ⭐
          </button>
        )}

        {/* Botão: Já fiz minha avaliação */}
        {mostrarBotaoGerarCupom && (
          <button
            type="button"
            onClick={gerarCupom}
            className="w-full bg-green-600 text-white py-3 sm:py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Já fiz minha avaliação
          </button>
        )}

        {/* FORMULÁRIO */}
        {!cupom && (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Nome */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium text-sm sm:text-base">Nome</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-3 sm:py-2 text-sm sm:text-base"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium text-sm sm:text-base">E-mail</label>
              <input
                type="email"
                className="border rounded-lg px-3 py-3 sm:py-2 text-sm sm:text-base"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium text-sm sm:text-base">WhatsApp</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-3 sm:py-2 text-sm sm:text-base"
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            {/* Item Consumido */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                Item consumido{" "}
                <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-3 sm:py-2 text-sm sm:text-base"
                placeholder="Ex: Café expresso"
                value={itemConsumido}
                onChange={(e) => setItemConsumido(e.target.value)}
              />
            </div>

            {/* Nota */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1 text-sm sm:text-base">Sua Nota</label>
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Nota selecionada: {rating || "nenhuma"}
              </p>
            </div>

            {/* MENSAGEM NEGATIVA */}
            {rating > 0 && rating < 4 && (
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium text-sm sm:text-base">
                  Conte o que aconteceu
                </label>
                <textarea
                  className="border rounded-lg px-3 py-2 text-sm sm:text-base"
                  rows={3}
                  placeholder="Descreva sua experiência"
                  value={mensagemNegativa}
                  onChange={(e) => setMensagemNegativa(e.target.value)}
                />
              </div>
            )}

            {/* LGPD */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4"
                checked={lgpd}
                onChange={(e) => setLgpd(e.target.checked)}
              />
              <p className="text-sm text-gray-600 sm:text-base">
                Concordo com o uso dos meus dados para contato e envio do cupom.
              </p>
            </div>

            {/* Botão Enviar */}
            <button
              type="button"
              onClick={enviarFeedback}
              className="w-full bg-blue-600 text-white py-3 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Enviar Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
