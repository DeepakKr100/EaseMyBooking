import { api } from "./api";

export async function loginApi(email, password) {
  const { data } = await api.post("/Auth/login", { email, password });
  // { token, userId, name, role }
  return data;
}

export async function registerApi(payload) {
  // payload: { name, email, password, role }
  const { data } = await api.post("/Auth/register", payload);
  return data;
}
