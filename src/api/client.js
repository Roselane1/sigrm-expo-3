// URL da API. Configurável via variável de ambiente EXPO_PUBLIC_API_URL
// (arquivo .env na raiz do projeto, ou definida no ambiente de build/CI).
// Em desenvolvimento local, aponte para o endereço IP do seu computador na
// rede (não "localhost" — o celular não entende isso como sendo o seu PC).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Confira sua internet e se o endereço da API está certo.",
      0
    );
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError((data && data.error) || `Erro (${response.status})`, response.status);
  }

  return data;
}

export { ApiError };
