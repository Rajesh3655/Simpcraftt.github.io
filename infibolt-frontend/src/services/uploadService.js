import { request } from "./api";

export const uploadService = {
  uploadInvoice: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/warranty", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadSupportAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/support", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
};
