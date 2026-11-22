import api from "./api";

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );

        onProgress(percentage);
      }
    },
  });

  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};
