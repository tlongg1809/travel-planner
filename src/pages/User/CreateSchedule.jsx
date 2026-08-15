import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import {
    getMySchedules,
    createSchedule,
} from "../../services/scheduleService";

export default function CreateSchedule() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);

    const [form, setForm] = useState({
        tieude: "",
        mota: "",
        ngaybatdau: "",
        ngayketthuc: "",
    });

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        fetchSchedules();
    }, [isAuthenticated, user]);

    const fetchSchedules = async () => {
        setLoading(true);

        try {
            const res = await getMySchedules(user.id);
            setSchedules(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy lịch trình:",
                error
            );
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!form.tieude.trim()) {
            alert("Vui lòng nhập tên lịch trình");
            return;
        }

        if (!form.ngaybatdau || !form.ngayketthuc) {
            alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
            return;
        }

        if (form.ngayketthuc < form.ngaybatdau) {
            alert("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
            return;
        }

        try {
            const res = await createSchedule({
                userId: user.id,
                tieude: form.tieude.trim(),
                mota: form.mota.trim(),
                ngaybatdau: form.ngaybatdau,
                ngayketthuc: form.ngayketthuc,
            });

            const newSchedule = res.data;

            setSchedules((prev) => [
                newSchedule,
                ...prev,
            ]);

            setForm({
                tieude: "",
                mota: "",
                ngaybatdau: "",
                ngayketthuc: "",
            });

            setOpenForm(false);

        } catch (error) {
            console.error(
                "Lỗi tạo lịch trình:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể tạo lịch trình"
            );
        }
    };

    const formatDate = (value) => {
        if (!value) return "";

        const datePart = String(value).slice(0, 10);

        const [year, month, day] = datePart.split("-");

        return `${day}/${month}/${year}`;
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <p className="text-gray-500">
                        Vui lòng đăng nhập để sử dụng lịch trình.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-6">

                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Lịch trình của tôi
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Tạo và quản lý các lịch trình du lịch cá nhân.
                        </p>
                    </div>

                    <button
                        onClick={() => setOpenForm(true)}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-medium text-white transition hover:bg-orange-600"
                    >
                        + Tạo lịch trình
                    </button>
                </div>

                {/* FORM TẠO */}
                {openForm && (
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Tạo lịch trình mới
                            </h2>

                            <button
                                onClick={() => setOpenForm(false)}
                                className="text-gray-400 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreate}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Tên lịch trình
                                </label>

                                <input
                                    name="tieude"
                                    value={form.tieude}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Phượt Vũng Tàu 2 ngày 1 đêm"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Mô tả
                                </label>

                                <textarea
                                    name="mota"
                                    value={form.mota}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Ghi chú cho lịch trình..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Ngày bắt đầu
                                    </label>

                                    <input
                                        type="date"
                                        name="ngaybatdau"
                                        value={form.ngaybatdau}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Ngày kết thúc
                                    </label>

                                    <input
                                        type="date"
                                        name="ngayketthuc"
                                        value={form.ngayketthuc}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpenForm(false)}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
                                >
                                    Tạo lịch trình
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* DANH SÁCH */}
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        Đang tải lịch trình...
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                        <div className="mb-4 text-6xl">
                            🗓️
                        </div>

                        <h2 className="font-semibold text-gray-800">
                            Chưa có lịch trình nào
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Hãy tạo lịch trình đầu tiên của bạn.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                onClick={() =>
                                    navigate(
                                        `/create-schedule/${schedule.id}`
                                    )
                                }
                                className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h3 className="line-clamp-2 text-xl font-bold text-gray-900">
                                            {schedule.tieude}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {formatDate(schedule.ngaybatdau)}
                                            {" → "}
                                            {formatDate(schedule.ngayketthuc)}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                                        Cá nhân
                                    </span>
                                </div>

                                {schedule.mota && (
                                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                                        {schedule.mota}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Địa điểm
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {schedule.so_diadiem || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Tổng dự kiến
                                        </p>

                                        <p className="mt-1 font-semibold text-orange-600">
                                            {Number(
                                                schedule.tongtien || 0
                                            ).toLocaleString("vi-VN")}
                                            đ
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm font-medium text-orange-500">
                                    Xem chi tiết →
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}