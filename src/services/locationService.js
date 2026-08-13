import api from "./api";

export const getCities = () => {
    return api.get("/locations/cities");
};


export const getDistricts = (city) => {
    return api.get("/locations/districts", {
        params: {
            city
        }
    });
};