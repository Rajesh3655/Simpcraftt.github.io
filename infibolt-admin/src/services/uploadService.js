import { request } from "./api";

export const uploadService = {
  uploadAsset: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadSupportAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/support", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadWarrantyDocument: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/warranty", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
};
