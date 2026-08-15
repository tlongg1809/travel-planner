import api from "./api";

export const getMySchedules = (userId) => {
    return api.get("/schedules", {
        params: { userId },
    });
};

export const getScheduleById = (
    scheduleId,
    userId
) => {
    return api.get(
        `/schedules/${scheduleId}`,
        {
            params: { userId },
        }
    );
};

export const createSchedule = (
    data
) => {
    return api.post(
        "/schedules",
        data
    );
};

export const updateSchedule = (
    scheduleId,
    data
) => {
    return api.put(
        `/schedules/${scheduleId}`,
        data
    );
};

export const deleteSchedule = (
    scheduleId,
    userId
) => {
    return api.delete(
        `/schedules/${scheduleId}`,
        {
            params: { userId },
        }
    );
};

export const addPlaceToSchedule = (
    scheduleId,
    data
) => {
    return api.post(
        `/schedules/${scheduleId}/places`,
        data
    );
};

export const updateSchedulePlace = (
    scheduleId,
    detailId,
    data
) => {
    return api.put(
        `/schedules/${scheduleId}/places/${detailId}`,
        data
    );
};

export const removePlaceFromSchedule = (
    scheduleId,
    detailId,
    userId
) => {
    return api.delete(
        `/schedules/${scheduleId}/places/${detailId}`,
        {
            params: { userId },
        }
    );
};

export const reorderSchedulePlaces = (
    scheduleId,
    data
) => {
    return api.put(
        `/schedules/${scheduleId}/order`,
        data
    );
};