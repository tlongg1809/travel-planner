import api from "./api";

/**
 * Tạo nhóm / chia sẻ lịch trình
 */
export const createGroup = (
    scheduleId,
    userId,
    tennhom
) => {
    return api.post(
        "/groups",
        {
            scheduleId,
            userId,
            tennhom,
        }
    );
};


/**
 * Tìm nhóm bằng mã phòng
 */
export const getGroupByRoomCode = (
    roomCode
) => {
    return api.get(
        `/groups/room/${roomCode}`
    );
};


/**
 * Tham gia nhóm
 */
export const joinGroup = (
    roomCode,
    userId
) => {
    return api.post(
        "/groups/join",
        {
            roomCode,
            userId,
        }
    );
};


/**
 * Lấy nhóm của user
 */
export const getMyGroups = (
    userId
) => {
    return api.get(
        "/groups",
        {
            params: { userId },
        }
    );
};


/**
 * Chi tiết nhóm
 */
export const getGroupById = (
    groupId,
    userId
) => {
    return api.get(
        `/groups/${groupId}`,
        {
            params: { userId },
        }
    );
};


/**
 * Kick thành viên
 */
export const kickMember = (
    groupId,
    memberId,
    userId
) => {
    return api.delete(
        `/groups/${groupId}/members/${memberId}`,
        {
            params: { userId },
        }
    );
};


/**
 * Rời nhóm
 */
export const leaveGroup = (
    groupId,
    userId
) => {
    return api.post(
        `/groups/${groupId}/leave`,
        {
            userId,
        }
    );
};


/**
 * Vote
 */
export const votePlace = (
    groupId,
    userId,
    placeId,
    value
) => {
    return api.post(
        `/groups/${groupId}/votes`,
        {
            userId,
            placeId,
            value,
        }
    );
};


/**
 * Lấy vote
 */
export const getGroupVotes = (
    groupId
) => {
    return api.get(
        `/groups/${groupId}/votes`
    );
};


/**
 * Comment
 */
export const addGroupComment = (
    groupId,
    userId,
    noidung
) => {
    return api.post(
        `/groups/${groupId}/comments`,
        {
            userId,
            noidung,
        }
    );
};


/**
 * Lấy comment
 */
export const getGroupComments = (
    groupId,
    userId
) => {
    return api.get(
        `/groups/${groupId}/comments`,
        {
            params: { userId },
        }
    );
};

export const requestJoinGroup = (roomCode, userId) => {
    return api.post("/groups/join-request", {
        roomCode,
        userId,
    });
};

export const getPendingMembers = (groupId, userId) => {
    return api.get(`/groups/${groupId}/pending`, {
        params: { userId },
    });
};

export const approveMember = (
    groupId,
    memberId,
    userId
) => {
    return api.post(
        `/groups/${groupId}/approve`,
        {
            memberId,
            userId,
        }
    );
};

export const rejectMember = (
    groupId,
    memberId,
    userId
) => {
    return api.post(
        `/groups/${groupId}/reject`,
        {
            memberId,
            userId,
        }
    );
};