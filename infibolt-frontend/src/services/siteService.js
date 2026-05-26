import { request } from "./api";

export const defaultContactSettings = {
  mobileNumber: "1234567890",
  phone: "1234567890",
  helpEmail: "support@infibolt.com",
  whatsapp: "https://wa.me/1234567890",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  linkedin: "",
};

export const siteService = {
  settings: async () => {
    const result = await request.get("/site-settings", { skipGlobalErrorToast: true });
    const contactSettings = {
      ...defaultContactSettings,
      ...(result?.contactSettings || {}),
    };
    if (!contactSettings.mobileNumber) contactSettings.mobileNumber = contactSettings.phone;
    if (!contactSettings.phone) contactSettings.phone = contactSettings.mobileNumber;
    return {
      contactSettings,
    };
  },
};
