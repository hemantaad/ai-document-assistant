import api from "./api";

export const sendChatMessage = async (payload) => {
  const response = await api.post("/chat", payload);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};
