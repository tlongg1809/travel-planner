import api from "./api";

export const getPlaces = (params) => {
  return api.get("/places", { params });
};