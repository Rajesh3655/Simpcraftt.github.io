import { request } from "./api";

export const uploadService = {
  uploadInvoice: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/warranty-draft", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadClaimPhoto: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/rma", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadSupportAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/uploads/support", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
};
