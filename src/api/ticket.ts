import apiClient from ".";

export const getMyTickets = (data: { phoneNumber: string }) => {
  return apiClient.get(`/Booking/GetMyTickets?phoneNumber=${data.phoneNumber}`);
};
