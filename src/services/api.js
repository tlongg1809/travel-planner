import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/travel-planner/backend/api"
});

export default api;