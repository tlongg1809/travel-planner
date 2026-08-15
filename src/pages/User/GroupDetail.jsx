import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import {
    getGroupById,
    kickMember,
    leaveGroup,
    votePlace,
    getGroupVotes,
    addGroupComment,
    getGroupComments,
    getPendingMembers,
    approveMember,
    rejectMember,
} from "../../services/groupService";

import {
    updateSchedulePlace,
    removePlaceFromSchedule,
    reorderSchedulePlaces,
} from "../../services/scheduleService";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const formatDateTime = (value) => {
    if (!value) return "Chưa đặt thời gian";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Chưa đặt thời gian";
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

function SortableGroupPlace({
    item,
    index,
    isHost,
    vote,
    onVote,
    onEdit,
    onDelete,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
                p-4
                shadow-sm
                ${isDragging ? "shadow-xl" : ""}
            `}
        >
            <div className="flex gap-3">

                {/* Chỉ Host mới thấy nút kéo */}
                {isHost ? (
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="
                            mt-1
                            flex
                            h-10
                            w-10
                            shrink-0
                            touch-none
                            select-none
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-gray-400
                            shadow-sm
                            active:bg-orange-50
                            active:text-orange-500
                        "
                    >
                        ☰
                    </button>
                ) : (
                    <div className="
                        mt-1
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-orange-100
                        font-bold
                        text-orange-600
                    ">
                        {index + 1}
                    </div>
                )}

                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>
                            <h3 className="font-bold text-gray-900">
                                {item.tendiadiem}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatDateTime(item.thoigian)}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {item.diachi}
                            </p>
                        </div>

                        <div className="font-semibold text-orange-600">
                            {Number(
                                item.chiphidukien || 0
                            ).toLocaleString("vi-VN")}đ
                        </div>
                    </div>

                    {/* Vote */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">

                        <span className="text-sm font-medium text-gray-700">
                            Bình chọn:
                        </span>

                        <button
                            onClick={() =>
                                onVote(
                                    item.diadiemid,
                                    1
                                )
                            }
                            className="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 hover:bg-green-100"
                        >
                            👍 {vote.dongy || 0}
                        </button>

                        <button
                            onClick={() =>
                                onVote(
                                    item.diadiemid,
                                    0
                                )
                            }
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                        >
                            👎 {vote.khongdongy || 0}
                        </button>
                    </div>

                    {/* Host control */}
                    {isHost && (
                        <div className="mt-4 flex gap-2">

                            <button
                                onClick={() =>
                                    onEdit(item)
                                }
                                className="rounded-lg border bg-white px-3 py-1.5 text-xs"
                            >
                                Sửa
                            </button>

                            <button
                                onClick={() =>
                                    onDelete(item)
                                }
                                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs text-red-500"
                            >
                                Xóa
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function GroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [group, setGroup] = useState(null);
    const [votes, setVotes] = useState([]);
    const [comments, setComments] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");

    const [editingPlace, setEditingPlace] = useState(null);

    const [showPending, setShowPending] = useState(false);
    const [pendingMembers, setPendingMembers] = useState([]);

    const [placeEditForm, setPlaceEditForm] = useState({
        thoigian: "",
        chiphidukien: "",
        ghichu: "",
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 8,
            },
        })
    );

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        fetchAll();
    }, [id, isAuthenticated, user]);

    const fetchAll = async () => {
        setLoading(true);

        try {
            const [
                        groupRes,
                        voteRes,
                        commentRes,
                    ] = await Promise.all([
                        getGroupById(id, user.id),
                        getGroupVotes(id),
                        getGroupComments(id, user.id),
                    ]);


            setGroup(groupRes.data);
            setVotes(voteRes.data || []);
            setComments(
                commentRes.data || []
            );

            if (
                    Number(groupRes.data.chuphongid) ===
                    Number(user.id)
                ) {
                    try {
                        const pendingRes = await getPendingMembers(
                            id,
                            user.id
                        );

                        setPendingMembers(
                            pendingRes.data || []
                        );
                    } catch (error) {
                        console.error(
                            "Lỗi lấy yêu cầu tham gia:",
                            error
                        );

                        setPendingMembers([]);
                    }
                } else {
                    setPendingMembers([]);
                }

        } catch (error) {
            console.error(
                "Lỗi lấy nhóm:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể lấy lịch trình nhóm"
            );

            navigate("/group-schedules");

        } finally {
            setLoading(false);
        }
    };

    const toDateTimeLocal = (value) => {
            if (!value) return "";

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "";
            }

            const year = date.getFullYear();
            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                date.getDate()
            ).padStart(2, "0");
            const hours = String(
                date.getHours()
            ).padStart(2, "0");
            const minutes = String(
                date.getMinutes()
            ).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

    const minScheduleDateTime =
        group?.ngaybatdau
            ? `${String(group.ngaybatdau).slice(0, 10)}T00:00`
            : "";

    const maxScheduleDateTime =
        group?.ngayketthuc
            ? `${String(group.ngayketthuc).slice(0, 10)}T23:59`
            : "";

    const isHost =
        Number(group?.chuphongid) ===
        Number(user?.id);

    const getVoteInfo = (placeId) => {
        return (
            votes.find(
                (vote) =>
                    Number(vote.diadiemid) ===
                    Number(placeId)
            ) || {
                dongy: 0,
                khongdongy: 0,
            }
        );
    };

    const handleVote = async (
        placeId,
        value
    ) => {
        try {
            await votePlace(
                id,
                user.id,
                placeId,
                value
            );

            const voteRes =
                await getGroupVotes(id);

            setVotes(
                voteRes.data || []
            );
        } catch (error) {
            console.error(
                "Lỗi bình chọn:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể bình chọn"
            );
        }
    };


    const handleApproveMember = async (memberId) => {
        try {
            await approveMember(
                id,
                memberId,
                user.id
            );

            await fetchAll();

        } catch (error) {
            console.error(
                "Lỗi duyệt thành viên:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể duyệt thành viên"
            );
        }
    };

    const handleRejectMember = async (memberId) => {
            try {
                await rejectMember(
                    id,
                    memberId,
                    user.id
                );

                await fetchAll();

            } catch (error) {
                console.error(
                    "Lỗi từ chối thành viên:",
                    error
                );

                alert(
                    error?.response?.data?.message ||
                    "Không thể từ chối thành viên"
                );
            }
        };

        const fetchPendingMembers = async () => {
        if (!isHost) return;

        try {
            const res = await getPendingMembers(
                id,
                user.id
            );

            setPendingMembers(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy yêu cầu tham gia:",
                error
            );
            setPendingMembers([]);
        }
    };

    const handleTogglePending = async () => {
        const next = !showPending;

        setShowPending(next);

        if (next) {
            await fetchPendingMembers();
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        try {
            await addGroupComment(
                id,
                user.id,
                commentText.trim()
            );

            setCommentText("");

            const res =
                await getGroupComments(
                    id,
                    user.id
                );

            setComments(
                res.data || []
            );

        } catch (error) {
            console.error(
                "Lỗi bình luận:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể bình luận"
            );
        }
    };

    const handleKick = async (
        memberId,
        memberName
    ) => {
        const ok = window.confirm(
            `Bạn có chắc muốn kick ${memberName}?`
        );

        if (!ok) return;

        try {
            await kickMember(
                id,
                memberId,
                user.id
            );

            fetchAll();

        } catch (error) {
            console.error(
                "Lỗi kick:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể kick thành viên"
            );
        }
    };

    const handleLeave = async () => {
        const ok = window.confirm(
            "Bạn có chắc muốn rời nhóm này?"
        );

        if (!ok) return;

        try {
            await leaveGroup(
                id,
                user.id
            );

            navigate(
                "/group-schedules"
            );

        } catch (error) {
            console.error(
                "Lỗi rời nhóm:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể rời nhóm"
            );
        }
    };

   const handleEditPlace = (item) => {
        if (!isHost) return;

        setEditingPlace(item);

        setPlaceEditForm({
            thoigian: toDateTimeLocal(item.thoigian),
            chiphidukien: item.chiphidukien || "",
            ghichu: item.ghichu || "",
        });
    };


    const handleSavePlace = async (e) => {
            e.preventDefault();

            if (!editingPlace) return;

            if (!placeEditForm.thoigian) {
                alert("Vui lòng chọn thời gian.");
                return;
            }

            try {
                await updateSchedulePlace(
                    group.lichtrinhid,
                    editingPlace.id,
                    {
                        userId: user.id,
                        thoigian: placeEditForm.thoigian,
                        chiphidukien:
                            Number(
                                placeEditForm.chiphidukien || 0
                            ),
                        ghichu:
                            placeEditForm.ghichu || "",
                    }
                );

                setEditingPlace(null);

                setPlaceEditForm({
                    thoigian: "",
                    chiphidukien: "",
                    ghichu: "",
                });

                await fetchAll();

            } catch (error) {
                console.error(
                    "Lỗi cập nhật địa điểm:",
                    error
                );

                alert(
                    error?.response?.data?.message ||
                    "Không thể cập nhật địa điểm"
                );
            }
        };

    const handleDragEnd = async (event) => {
            if (!isHost) return;

            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = group.places.findIndex(
                (item) => item.id === active.id
            );

            const newIndex = group.places.findIndex(
                (item) => item.id === over.id
            );

            if (oldIndex === -1 || newIndex === -1) {
                return;
            }

            const newPlaces = arrayMove(
                group.places,
                oldIndex,
                newIndex
            );

            setGroup((prev) => ({
                ...prev,
                places: newPlaces,
            }));

            const items = newPlaces.map(
                (item, index) => ({
                    id: item.id,
                    thutu: index + 1,
                    thoigian: item.thoigian || null,
                })
            );

            try {
                await reorderSchedulePlaces(
                    group.lichtrinhid,
                    {
                        userId: user.id,
                        items,
                    }
                );
            } catch (error) {
                console.error(
                    "Lỗi sắp xếp:",
                    error
                );

                fetchAll();
            }
        };

    const handleDeletePlace = async (
        item
    ) => {
        if (!isHost) return;

        const ok = window.confirm(
            `Xóa ${item.tendiadiem} khỏi lịch trình?`
        );

        if (!ok) return;

        try {
            await removePlaceFromSchedule(
                group.lichtrinhid,
                item.id,
                user.id
            );

            fetchAll();

        } catch (error) {
            console.error(
                "Lỗi xóa:",
                error
            );
        }
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="p-8 text-center text-gray-500">
                    Vui lòng đăng nhập.
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="p-8 text-center text-gray-500">
                    Đang tải lịch trình nhóm...
                </div>
            </Layout>
        );
    }

    if (!group) {
        return null;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-6">

                {/* HEADER */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

                    <button
                        onClick={() =>
                            navigate(
                                "/group-schedules"
                            )
                        }
                        className="mb-3 text-sm text-gray-500 hover:text-orange-500"
                    >
                        ← Quay lại nhóm
                    </button>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div>
                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold text-gray-900">
                                    {group.tennhom}
                                </h1>

                                {isHost && (
                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                                        HOST
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-gray-600">
                                {group.tieude}
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                {String(
                                    group.ngaybatdau
                                ).slice(0, 10)}
                                {" → "}
                                {String(
                                    group.ngayketthuc
                                ).slice(0, 10)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-orange-50 p-4">
                            <p className="text-xs text-orange-700">
                                Mã phòng
                            </p>

                            <p className="mt-1 text-2xl font-bold tracking-widest text-orange-600">
                                {group.roomcode}
                            </p>

                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        group.roomcode
                                    )
                                }
                                className="mt-2 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs cursor-pointer"
                            >
                                Sao chép
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* TIMELINE */}
                    <div className="xl:col-span-2">

                        <div className="rounded-2xl bg-white p-6 shadow-sm">

                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    Lịch trình
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {group.places?.length || 0} địa điểm
                                </span>
                            </div>

                            {group.places?.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    Chưa có địa điểm.
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={group.places.map(
                                            (item) => item.id
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-4">

                                            {group.places.map(
                                                (item, index) => (
                                                    <SortableGroupPlace
                                                        key={item.id}
                                                        item={item}
                                                        index={index}
                                                        isHost={isHost}
                                                        vote={getVoteInfo(
                                                            item.diadiemid
                                                        )}
                                                        onVote={handleVote}
                                                        onEdit={handleEditPlace}
                                                        onDelete={handleDeletePlace}
                                                    />
                                                )
                                            )}

                                        </div>
                                    </SortableContext>
                                </DndContext>                              
                            )}

                        </div>

                        {/* MODAL SỬA ĐỊA ĐIỂM */}
                        {editingPlace && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                                {/* Nền */}
                                <div
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                    onClick={() =>
                                        setEditingPlace(null)
                                    }
                                />

                                {/* Modal */}
                                <form
                                    onSubmit={handleSavePlace}
                                    className="
                                        relative
                                        z-10
                                        w-full
                                        max-w-lg
                                        max-h-[90vh]
                                        overflow-y-auto
                                        rounded-2xl
                                        bg-white
                                        p-6
                                        shadow-2xl
                                    "
                                >
                                    {/* Header */}
                                    <div className="mb-5 flex items-center justify-between">

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Chỉnh sửa địa điểm
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {editingPlace.tendiadiem}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingPlace(null)
                                            }
                                            className="
                                                rounded-full
                                                p-2
                                                text-gray-400
                                                hover:bg-gray-100
                                                hover:text-gray-700
                                                cursor-pointer
                                            "
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-4">

                                        {/* THỜI GIAN */}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Ngày và giờ
                                            </label>

                                            <input
                                                type="datetime-local"
                                                value={
                                                    placeEditForm.thoigian
                                                }
                                                min={minScheduleDateTime}
                                                max={maxScheduleDateTime}
                                                onChange={(e) =>
                                                    setPlaceEditForm({
                                                        ...placeEditForm,
                                                        thoigian:
                                                            e.target.value,
                                                    })
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    p-3
                                                    outline-none
                                                    focus:border-orange-500
                                                    focus:ring-2
                                                    focus:ring-orange-100
                                                "
                                            />

                                            <p className="mt-1 text-xs text-gray-500">
                                                Chỉ được chọn trong khoảng thời gian của lịch trình.
                                            </p>
                                        </div>

                                        {/* CHI PHÍ */}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Chi phí dự kiến
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    placeEditForm.chiphidukien
                                                }
                                                onChange={(e) =>
                                                    setPlaceEditForm({
                                                        ...placeEditForm,
                                                        chiphidukien:
                                                            e.target.value,
                                                    })
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    p-3
                                                    outline-none
                                                    focus:border-orange-500
                                                    focus:ring-2
                                                    focus:ring-orange-100
                                                "
                                            />
                                        </div>

                                        {/* GHI CHÚ */}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Ghi chú
                                            </label>

                                            <textarea
                                                rows="4"
                                                value={
                                                    placeEditForm.ghichu
                                                }
                                                onChange={(e) =>
                                                    setPlaceEditForm({
                                                        ...placeEditForm,
                                                        ghichu:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Ví dụ: Ăn sáng, check-in..."
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    p-3
                                                    outline-none
                                                    focus:border-orange-500
                                                    focus:ring-2
                                                    focus:ring-orange-100
                                                "
                                            />
                                        </div>
                                    </div>

                                    {/* BUTTON */}
                                    <div className="mt-6 flex justify-end gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingPlace(null)
                                            }
                                            className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-white
                                                px-5
                                                py-2.5
                                                text-sm
                                                hover:bg-gray-50
                                                cursor-pointer
                                            "
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            type="submit"
                                            className="
                                                rounded-xl
                                                bg-orange-500
                                                px-5
                                                py-2.5
                                                text-sm
                                                font-medium
                                                text-white
                                                hover:bg-orange-600
                                                cursor-pointer
                                            "
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* COMMENTS */}
                        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

                            <h2 className="text-xl font-bold">
                                Ý kiến của thành viên
                            </h2>

                            <form
                                onSubmit={
                                    handleComment
                                }
                                className="mt-4 flex gap-3"
                            >
                                <input
                                    value={
                                        commentText
                                    }
                                    onChange={(e) =>
                                        setCommentText(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập ý kiến..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-orange-500"
                                />

                                <button
                                    type="submit"
                                    className="rounded-xl bg-slate-900 px-5 py-3 text-white"
                                >
                                    Gửi
                                </button>
                            </form>

                            <div className="mt-5 space-y-4">

                                {comments.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Chưa có ý kiến nào.
                                    </p>
                                ) : (
                                    comments.map(
                                        (comment) => (
                                            <div
                                                key={
                                                    comment.id
                                                }
                                                className="rounded-xl bg-gray-50 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">

                                                    <span className="font-medium text-gray-900">
                                                        {
                                                            comment.hoten
                                                        }
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        {
                                                            comment.ngaytao
                                                        }
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-gray-600">
                                                    {
                                                        comment.noidung
                                                    }
                                                </p>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MEMBERS */}
                    <div>
                        <div className="sticky top-4 rounded-2xl bg-white p-6 shadow-sm">

                           <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-bold">
                                    Thành viên
                                </h2>

                                <div className="flex items-center gap-2">

                                    {isHost && (
                                        <button
                                            type="button"
                                            onClick={handleTogglePending}
                                            className="
                                                rounded-lg
                                                border
                                                border-orange-200
                                                bg-orange-50
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-medium
                                                text-orange-600
                                                hover:bg-orange-100
                                            "
                                        >
                                            Duyệt
                                            {pendingMembers.length > 0 && (
                                                <span className="ml-1">
                                                    ({pendingMembers.length})
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                                        {group.members?.length || 0}
                                    </span>

                                </div>
                            </div>

                        {/* FORM DUYỆT */}
                            {isHost && showPending && (
                                <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4">

                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">
                                            Yêu cầu tham gia
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() => setShowPending(false)}
                                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {pendingMembers.length === 0 ? (
                                        <p className="py-3 text-center text-sm text-gray-500">
                                            Không có yêu cầu tham gia.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingMembers.map((member) => (
                                                <div
                                                    key={member.nguoidungid}
                                                    className="rounded-xl bg-white p-3"
                                                >
                                                    <div className="flex items-center gap-3">

                                                        {member.hinhanh ? (
                                                            <img
                                                                src={member.hinhanh}
                                                                alt=""
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="
                                                                flex
                                                                h-10
                                                                w-10
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-orange-100
                                                                font-medium
                                                                text-orange-600
                                                            ">
                                                                {member.hoten?.[0] || "U"}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium text-gray-800">
                                                                {member.hoten}
                                                            </p>

                                                            <p className="truncate text-xs text-gray-500">
                                                                {member.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await handleApproveMember(
                                                                    member.nguoidungid
                                                                );
                                                                await fetchPendingMembers();
                                                            }}
                                                            className="
                                                                flex-1
                                                                rounded-lg
                                                                bg-green-500
                                                                px-3
                                                                py-2
                                                                text-xs
                                                                font-medium
                                                                text-white
                                                                hover:bg-green-600
                                                                cursor-pointer
                                                            "
                                                        >
                                                            Duyệt
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await handleRejectMember(
                                                                    member.nguoidungid
                                                                );
                                                                await fetchPendingMembers();
                                                            }}
                                                            className="
                                                                flex-1
                                                                rounded-lg
                                                                border
                                                                border-red-200
                                                                bg-white
                                                                px-3
                                                                py-2
                                                                text-xs
                                                                font-medium
                                                                text-red-500
                                                                hover:bg-red-50
                                                                cursor-pointer
                                                            "
                                                        >
                                                            Từ chối
                                                        </button>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mt-5 space-y-3">

                                {group.members?.map(
                                    (member) => {
                                        const memberIsHost =
                                            Number(
                                                member.nguoidungid
                                            ) ===
                                            Number(
                                                group.chuphongid
                                            );

                                        return (
                                            <div
                                                key={
                                                    member.nguoidungid
                                                }
                                                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                                            >
                                                {member.hinhanh ? (
                                                    <img
                                                        src={
                                                            member.hinhanh
                                                        }
                                                        alt=""
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-medium text-orange-600">
                                                        {member.hoten?.[0] ||
                                                            "U"}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-800">
                                                        {
                                                            member.hoten
                                                        }
                                                    </p>

                                                    <p className="truncate text-xs text-gray-500">
                                                        {
                                                            member.email
                                                        }
                                                    </p>
                                                </div>

                                                {memberIsHost ? (
                                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-600">
                                                        Host
                                                    </span>
                                                ) : isHost ? (
                                                    <button
                                                        onClick={() =>
                                                            handleKick(
                                                                member.nguoidungid,
                                                                member.hoten
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                                                    >
                                                        Kick
                                                    </button>
                                                ) : null}
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {!isHost && (
                                <button
                                    onClick={
                                        handleLeave
                                    }
                                    className="mt-5 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                                >
                                    Rời nhóm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}