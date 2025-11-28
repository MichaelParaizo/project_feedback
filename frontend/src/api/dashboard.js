// src/api/dashboard.js

const API_BASE_URL = "http://localhost:8080";

// Helper para headers
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Função genérica de request com tratamento de token expirado
async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch  {
    throw new Error("Falha de conexão com o servidor.");
  }

  // ---------------------------
  // 1) se 401 → token expirou
  // ---------------------------
  if (res.status === 401) {
    logoutAndRedirect();
    return;
  }

  // Tentamos ler JSON, mas sem quebrar se vier vazio
  let body = null;
  try {
    body = await res.clone().json();
  } catch {
    body = null;
  }

  // ----------------------------------------------------
  // 2) se backend mandar 500 por causa do ExpiredJwtException
  // ----------------------------------------------------
  if (res.status === 500) {
    const msg = body?.message || "";

    if (msg.includes("JWT expired") || msg.includes("ExpiredJwtException")) {
      logoutAndRedirect();
      return;
    }
  }

  // ---------------------------
  // Erros normais
  // ---------------------------
  if (!res.ok) {
    const msg = body?.message || "Erro na requisição";
    throw new Error(msg);
  }

  // Sem conteúdo
  if (res.status === 204) return null;

  // Se tem JSON válido
  return body;
}

// Logout + redirect
function logoutAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
  window.location.href = "/admin/login";
}

// API CALLS =========================================

export async function getDashboard(token) {
  return request("/admin/dashboard", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getFeedbacks(token, params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v);
  });
  const query = sp.toString();
  const url = query ? `/admin/feedbacks?${query}` : "/admin/feedbacks";

  return request(url, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getFeedbackById(token, id) {
  return request(`/admin/feedbacks/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function responderFeedbackEmail(token, id, mensagem) {
  return request(`/admin/feedbacks/${id}/responder-email`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ mensagem }),
  });
}

export async function validarCupomDoFeedback(token, id) {
  return request(`/admin/feedbacks/${id}/validar-cupom`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export async function getHorariosCriticos(token) {
  return request("/admin/feedbacks/horarios", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getCupons(token, params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v);
  });

  const query = sp.toString();
  const url = query ? `/admin/cupoms?${query}` : "/admin/cupoms";

  return request(url, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function validarCupom(token, id) {
  return request(`/admin/cupoms/${id}/validar`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}
