import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import {
    getMySchedules,
    addPlaceToSchedule,
} from "../../services/scheduleService";

export default function AddToScheduleButton({ place }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [openSchedule, setOpenSchedule] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [addingScheduleId, setAddingScheduleId] = useState(null);

    const handleOpenSchedule = async (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập để thêm vào lịch trình.");
            return;
        }

        setOpenSchedule(true);
        setLoadingSchedules(true);

        try {
            const res = await getMySchedules(user.id);
            setSchedules(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy lịch trình:",
                error
            );

            setSchedules([]);

            alert(
                error?.response?.data?.message ||
                "Không thể lấy danh sách lịch trình"
            );
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleAddToSchedule = async (scheduleId) => {
        if (addingScheduleId) return;

        try {
            setAddingScheduleId(scheduleId);

            await addPlaceToSchedule(
                scheduleId,
                {
                    userId: user.id,
                    placeId: place.id,
                }
            );

            alert(
                `Đã thêm "${place.tendiadiem}" vào lịch trình`
            );

            setOpenSchedule(false);

        } catch (error) {
            console.error(
                "Lỗi thêm vào lịch trình:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể thêm địa điểm vào lịch trình"
            );
        } finally {
            setAddingScheduleId(null);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpenSchedule}
                className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-orange-500
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-orange-600
                    cursor-pointer
                "
            >
                <Plus size={18} />
                Thêm vào lịch trình
            </button>

            {openSchedule && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() =>
                            setOpenSchedule(false)
                        }
                    />

                    {/* Modal */}
                    <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Thêm vào lịch trình
                                </h2>

                                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                    {place.tendiadiem}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setOpenSchedule(false)
                                }
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {loadingSchedules ? (
                            <div className="py-10 text-center text-gray-500">
                                Đang tải lịch trình...
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="py-8 text-center">

                                <div className="mb-3 text-4xl">
                                    🗓️
                                </div>

                                <p className="font-medium text-gray-800">
                                    Bạn chưa có lịch trình
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Hãy tạo lịch trình trước khi thêm địa điểm.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenSchedule(false);
                                        navigate("/create-schedule");
                                    }}
                                    className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 cursor-pointer"
                                >
                                    + Tạo lịch trình
                                </button>
                            </div>
                        ) : (
                            <div className="max-h-[400px] space-y-3 overflow-y-auto">

                                {schedules.map((schedule) => (
                                    <button
                                        key={schedule.id}
                                        type="button"
                                        onClick={() =>
                                            handleAddToSchedule(
                                                schedule.id
                                            )
                                        }
                                        disabled={
                                            addingScheduleId ===
                                            schedule.id
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-between gap-3">

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {schedule.tieude}
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {String(
                                                        schedule.ngaybatdau
                                                    ).slice(0, 10)}
                                                    {" → "}
                                                    {String(
                                                        schedule.ngayketthuc
                                                    ).slice(0, 10)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {schedule.so_diadiem || 0}
                                                    {" địa điểm"}
                                                </p>
                                            </div>

                                            {addingScheduleId ===
                                            schedule.id ? (
                                                <span className="shrink-0 text-sm text-orange-500">
                                                    Đang thêm...
                                                </span>
                                            ) : (
                                                <Plus
                                                    size={20}
                                                    className="shrink-0 text-orange-500"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}

                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}