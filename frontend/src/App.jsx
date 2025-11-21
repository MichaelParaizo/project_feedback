import { useState } from "react";
import StarRating from "./components/StarRating";

export default function App() {
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-6">

        {/* Título */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Seu Feedback</h1>
          <p className="text-gray-500 text-sm">
            Responda abaixo e receba seu cupom 🎁
          </p>
        </div>

        {/* Formulário */}
        <form className="space-y-4">

          {/* Nome */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Nome</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Digite seu nome"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">E-mail</label>
            <input
              type="email"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">WhatsApp</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Item consumido */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Item consumido</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Ex: Café expresso"
            />
          </div>

          {/* Nota (estrelas) */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Sua Nota</label>

            <StarRating value={rating} onChange={setRating} />

            <p className="text-xs text-gray-500 mt-1">
              Nota selecionada: {rating || "nenhuma"}
            </p>
          </div>

          {/* Checkbox LGPD */}
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <p className="text-sm text-gray-600">
              Concordo com o uso dos meus dados para contato e envio do cupom
            </p>
          </div>

          {/* Botão enviar */}
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
