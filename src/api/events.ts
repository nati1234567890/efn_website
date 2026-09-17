import apiClient from ".";

export const getEvents = () => {
  return apiClient.get("/Events");
};
export const getEventPrice = () => {
  return apiClient.get("/Events/GetEventPrice");
};
