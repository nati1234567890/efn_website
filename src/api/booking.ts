import apiClient from ".";
type BookingData = {
  TotalPrice: number;
  Status: string;
  Email: string;
  EventId: string;
  PhoneNumber: string;
  Participant: {
    PhoneNumber: string;
    FullName: string;
    Email: string;
  };
  BookingDetails: Array<{
    TshirtId: string;
    Quantity: number;
  }>;
};

export const book = (data: BookingData) => {
  return apiClient.post("/Booking/RunningBooking", data);
};
