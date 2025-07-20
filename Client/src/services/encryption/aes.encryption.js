import CryptoJS from "crypto-js";

const SALT = import.meta.env.VITE_SALT;

const deriveKey = (userId) => {
  return CryptoJS.SHA256(userId + SALT).toString();
};

export const encryptData = (data, userId) => {
  const key = deriveKey(userId);
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decryptData = (encryptedData, userId) => {
  const key = deriveKey(userId);
  const decryptedData = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
};
