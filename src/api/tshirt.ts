import apiClient from ".";

export const getTshirts = () => {
  return apiClient.get("/TShirt");
};
