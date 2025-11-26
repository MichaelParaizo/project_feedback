import { useState } from "react";
import { loginRequest } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===========================
  // FUNÇÃO QUE O FORM VAI USAR
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const data = await loginRequest(email, senha);

      login(data.token, {
        adminId: data.adminId,
        nome: data.nome,
        email: data.email,
        restaurantId: data.restaurantId,
      });

      navigate("/admin/dashboard");

    } catch {
      setErro("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // TELA
  // ===========================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white">
            Review <span className="text-purple-400">Prime AI</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Gestão Inteligente de Feedbacks de Clientes
          </p>
        </div>

        <h2 className="text-lg font-semibold text-white text-center mb-6">
          Bem-vindo de volta
        </h2>

        {/* AQUI ESTÁ A LIGAÇÃO DO FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="text-gray-300 text-sm">Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <p className="text-red-400 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all text-white font-medium shadow-lg shadow-purple-600/40"
          >
            {loading ? "Entrando..." : "Entrar na Plataforma →"}
          </button>
        </form>

      </div>
    </div>
  );
}
