import CryptoJS from "crypto-js";

const secretKey = process.env.AES_SECRET; // Access secret key from environment variable

// Encrypt data
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

// Decrypt data
export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
