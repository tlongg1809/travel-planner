import api from "./api";
export const getPlaces = (category = 0) => {
    return api.get(`/places.php?category=${category}`);
}