import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../contexts/AuthContext";

import {
    getScheduleById,
    updateSchedule,
    updateSchedulePlace,
    removePlaceFromSchedule,
    reorderSchedulePlaces,
} from "../../services/scheduleService";

import { createGroup } from "../../services/groupService";

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
function SortablePlaceItem({
    item,
    index,
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
            <div className="flex items-start gap-3">

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
                        active:cursor-grabbing
                        active:bg-orange-50
                        active:text-orange-500
                    "
                >
                    ☰
                </button>

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

                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>
                            <h3 className="font-bold text-gray-900">
                                {item.tendiadiem}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {item.thoigian
                                    ? new Date(item.thoigian).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "Chưa đặt thời gian"}
                            </p>
                        </div>

                        <div className="font-semibold text-orange-600">
                            {Number(
                                item.chiphidukien || 0
                            ).toLocaleString("vi-VN")}
                            đ
                        </div>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        {item.diachi}
                    </p>

                    {item.ghichu && (
                        <p className="mt-2 text-sm text-gray-600">
                            Ghi chú: {item.ghichu}
                        </p>
                    )}

                    <div className="mt-4 flex gap-2">

                        <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="rounded-lg border bg-white px-3 py-1.5 text-xs"
                        >
                            Sửa
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs text-red-500"
                        >
                            Xóa
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ScheduleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);

    const [editingPlace, setEditingPlace] = useState(null);

    const [placeEditForm, setPlaceEditForm] = useState({
        thoigian: "",
        chiphidukien: "",
        ghichu: "",
    });

    const [editForm, setEditForm] = useState({
        tieude: "",
        mota: "",
        ngaybatdau: "",
        ngayketthuc: "",
    });


    const [shareLoading, setShareLoading] = useState(false);
    const [roomCode, setRoomCode] = useState("");

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
        if (!isAuthenticated || !user?.id) {
            return;
        }

        fetchSchedule();
    }, [id, isAuthenticated, user]);

    const fetchSchedule = async () => {
        setLoading(true);

        try {
            const res = await getScheduleById(
                id,
                user.id
            );

            setSchedule(res.data);

            setEditForm({
                tieude: res.data.tieude || "",
                mota: res.data.mota || "",
                ngaybatdau:
                    res.data.ngaybatdau
                        ? String(
                              res.data.ngaybatdau
                          ).slice(0, 10)
                        : "",
                ngayketthuc:
                    res.data.ngayketthuc
                        ? String(
                              res.data.ngayketthuc
                          ).slice(0, 10)
                        : "",
            });

        } catch (error) {
            console.error(
                "Lỗi lấy chi tiết lịch trình:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể lấy lịch trình"
            );

            navigate("/create-schedule");

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

    const handleUpdateSchedule = async (
        e
    ) => {
        e.preventDefault();

        try {
            await updateSchedule(
                id,
                {
                    userId: user.id,
                    ...editForm,
                }
            );

            setEditing(false);
            fetchSchedule();

        } catch (error) {
            console.error(
                "Lỗi cập nhật lịch trình:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể cập nhật"
            );
        }
    };


    const handleDeletePlace = async (
            detailId
        ) => {
            const ok = window.confirm(
                "Bạn có chắc muốn xóa địa điểm này?"
            );

            if (!ok) return;

            try {
                await removePlaceFromSchedule(
                    id,
                    detailId,
                    user.id
                );

                fetchSchedule();

            } catch (error) {
                console.error(
                    "Lỗi xóa địa điểm:",
                    error
                );
            }
        };

    const handleUpdatePlace = (detail) => {
            setEditingPlace(detail);

            setPlaceEditForm({
                thoigian: toDateTimeLocal(
                    detail.thoigian
                ),
                chiphidukien:
                    detail.chiphidukien || "",
                ghichu:
                    detail.ghichu || "",
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
                id,
                editingPlace.id,
                {
                    userId: user.id,
                    thoigian:
                        placeEditForm.thoigian,
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

            await fetchSchedule();

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

    //Tạo min và max
    const minScheduleDateTime =
        schedule?.ngaybatdau
            ? `${String(
                schedule.ngaybatdau
            ).slice(0, 10)}T00:00`
            : "";

    const maxScheduleDateTime =
        schedule?.ngayketthuc
            ? `${String(
                schedule.ngayketthuc
            ).slice(0, 10)}T23:59`
            : "";

    const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
        return;
    }

    const oldIndex = schedule.details.findIndex(
        (item) => item.id === active.id
    );

    const newIndex = schedule.details.findIndex(
        (item) => item.id === over.id
    );

    if (oldIndex === -1 || newIndex === -1) {
        return;
    }

    const newDetails = arrayMove(
        schedule.details,
        oldIndex,
        newIndex
    );

    // Cập nhật UI ngay
    setSchedule((prev) => ({
        ...prev,
        details: newDetails,
    }));

    const items = newDetails.map(
        (item, index) => ({
            id: item.id,
            thutu: index + 1,
            thoigian: item.thoigian || null,
        })
    );

    try {
        await reorderSchedulePlaces(id, {
            userId: user.id,
            items,
        });
    } catch (error) {
        console.error(
            "Lỗi lưu thứ tự:",
            error
        );

        fetchSchedule();
    }
    };

    const handleCreateGroup = async () => {
        setShareLoading(true);

        try {
            const res = await createGroup(
                id,
                user.id,
                schedule.tieude
            );

            setRoomCode(
                res.data.roomcode
            );

        } catch (error) {
            console.error(
                "Lỗi chia sẻ nhóm:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể tạo nhóm"
            );

        } finally {
            setShareLoading(false);
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
                    Đang tải...
                </div>
            </Layout>
        );
    }

    if (!schedule) {
        return null;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-6">

                {/* HEADER */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <button
                                onClick={() =>
                                    navigate(
                                        "/create-schedule"
                                    )
                                }
                                className="mb-3 text-sm text-gray-500 hover:text-orange-500"
                            >
                                ← Quay lại lịch trình
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900">
                                {schedule.tieude}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {String(
                                    schedule.ngaybatdau
                                ).slice(0, 10)}
                                {" → "}
                                {String(
                                    schedule.ngayketthuc
                                ).slice(0, 10)}
                            </p>

                            {schedule.mota && (
                                <p className="mt-3 text-gray-600">
                                    {schedule.mota}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">

                            <button
                                onClick={() =>
                                    setEditing(
                                        !editing
                                    )
                                }
                                className="rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                                Chỉnh sửa
                            </button>

                            <button
                                onClick={
                                    handleCreateGroup
                                }
                                disabled={
                                    shareLoading
                                }
                                className="rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 cursor-pointer"
                            >
                                {shareLoading
                                    ? "Đang tạo..."
                                    : "Chia sẻ nhóm"}
                            </button>
                        </div>
                    </div>

                    {/* ROOM CODE */}
                    {roomCode && (
                        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">

                            <p className="text-sm text-orange-700">
                                Mã phòng của bạn
                            </p>

                            <div className="mt-1 flex items-center justify-between gap-3">
                                <span className="text-2xl font-bold tracking-widest text-orange-600">
                                    {roomCode}
                                </span>

                                <button
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            roomCode
                                        )
                                    }
                                    className="rounded-lg bg-white px-3 py-2 text-sm border border-orange-200 cursor-pointer"
                                >
                                    Sao chép
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-orange-600">
                                Bạn bè có thể dùng mã này để tham gia lịch trình.
                            </p>
                        </div>
                    )}
                </div>

                {/* FORM EDIT */}
                {editing && (
                    <form
                        onSubmit={
                            handleUpdateSchedule
                        }
                        className="mb-6 rounded-2xl bg-white p-6 shadow-sm"
                    >
                        <h2 className="mb-4 text-xl font-bold ">
                            Chỉnh sửa lịch trình
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">

                            <input
                                value={
                                    editForm.tieude
                                }
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        tieude:
                                            e.target.value,
                                    })
                                }
                                className="rounded-xl border p-3"
                            />

                            <input
                                type="date"
                                value={
                                    editForm.ngaybatdau
                                }
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        ngaybatdau:
                                            e.target.value,
                                    })
                                }
                                className="rounded-xl border p-3"
                            />

                            <input
                                type="date"
                                value={
                                    editForm.ngayketthuc
                                }
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        ngayketthuc:
                                            e.target.value,
                                    })
                                }
                                className="rounded-xl border p-3"
                            />

                            <textarea
                                value={
                                    editForm.mota
                                }
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        mota:
                                            e.target.value,
                                    })
                                }
                                className="rounded-xl border p-3"
                                placeholder="Mô tả"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 rounded-xl bg-orange-500 px-5 py-2 text-white cursor-pointer"
                        >
                            Lưu
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* TIMELINE */}
                    <div className="xl:col-span-2">

                        <div className="rounded-2xl bg-white p-6 shadow-sm">

                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    Timeline
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {schedule.details?.length || 0} địa điểm
                                </span>
                            </div>

                            {schedule.details?.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    Chưa có địa điểm nào trong lịch trình.
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={schedule.details.map(
                                            (item) => item.id
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-4">

                                            {schedule.details.map(
                                                (item, index) => (
                                                    <SortablePlaceItem
                                                        key={item.id}
                                                        item={item}
                                                        index={index}
                                                        onEdit={handleUpdatePlace}
                                                        onDelete={handleDeletePlace}
                                                    />
                                                )
                                            )}

                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                        {editingPlace && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                                {/* Nền mờ */}
                                <div
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                    onClick={() => setEditingPlace(null)}
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

                                    {/* Form */}
                                    <div className="grid gap-4">

                                        {/* THỜI GIAN */}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Ngày và giờ
                                            </label>

                                            <input
                                                type="datetime-local"
                                                value={placeEditForm.thoigian}
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
                                                Chỉ được chọn trong thời gian của lịch trình.
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
                                                value={placeEditForm.chiphidukien}
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
                                                value={placeEditForm.ghichu}
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

                                    {/* Buttons */}
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

                    </div>
                    
                   

                    {/* BUDGET */}
                    <div>
                        <div className="sticky top-4 rounded-2xl bg-white p-6 shadow-sm">

                            <h2 className="text-xl font-bold">
                                Ngân sách
                            </h2>

                            <div className="mt-5 rounded-2xl bg-orange-50 p-5">
                                <p className="text-sm text-orange-700">
                                    Tổng chi phí dự kiến
                                </p>

                                <p className="mt-2 text-3xl font-bold text-orange-600">
                                    {Number(
                                        schedule.tongtien || 0
                                    ).toLocaleString(
                                        "vi-VN"
                                    )}
                                    đ
                                </p>
                            </div>

                            <div className="mt-5 space-y-3">

                                {schedule.details?.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between gap-3 text-sm"
                                        >
                                            <span className="line-clamp-1 text-gray-600">
                                                {item.tendiadiem}
                                            </span>

                                            <span className="shrink-0 font-medium">
                                                {Number(
                                                    item.chiphidukien ||
                                                    0
                                                ).toLocaleString(
                                                    "vi-VN"
                                                )}
                                                đ
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}