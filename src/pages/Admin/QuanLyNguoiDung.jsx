import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    Shield,
    Loader2,
} from "lucide-react";
const API_URL = "http://localhost:5000/api";
function QuanLyNguoiDung() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    /**
     * Lấy danh sách user
     */
    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/admin/users`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Không thể lấy danh sách người dùng."
                );
            }

            setUsers(data);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách người dùng:",
                error
            );

            alert(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);


    /**
     * Khóa / mở khóa
     */
    const handleToggleStatus = async (user) => {
        const currentStatus = Number(user.trangthai);

        const newStatus =
            currentStatus === 1 ? 0 : 1;

        const action =
            newStatus === 1
                ? "mở khóa"
                : "khóa";

        const confirmed = window.confirm(
            `Bạn có chắc muốn ${action} tài khoản "${user.hoten}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(user.id);

            const response = await fetch(
                `${API_URL}/admin/users/${user.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trangthai: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Không thể cập nhật trạng thái."
                );
            }

            setUsers((prev) =>
                prev.map((item) =>
                    item.id === user.id
                        ? data.user
                        : item
                )
            );

        } catch (error) {
            console.error(
                "Lỗi cập nhật trạng thái:",
                error
            );

            alert(error.message);
        } finally {
            setUpdatingId(null);
        }
    };


    /**
     * Tìm kiếm
     */
    const filteredUsers = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return users;
        }

        return users.filter((user) => {
            const name =
                user.hoten?.toLowerCase() || "";

            const email =
                user.email?.toLowerCase() || "";

            return (
                name.includes(keyword) ||
                email.includes(keyword)
            );
        });
    }, [users, search]);


    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) =>
            Number(user.trangthai) === 1
    ).length;

    const blockedUsers = users.filter(
        (user) =>
            Number(user.trangthai) === 0
    ).length;

    const adminUsers = users.filter(
        (user) =>
            Number(user.vaitro) === 1
    ).length;


    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "vi-VN"
        );
    };


    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Quản lý người dùng
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Quản lý tài khoản người dùng trong hệ thống.
                </p>
            </div>


            {/* THỐNG KÊ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Tổng người dùng"
                    value={totalUsers}
                    icon={<Users size={22} />}
                    iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                    title="Đang hoạt động"
                    value={activeUsers}
                    icon={<UserCheck size={22} />}
                    iconClass="bg-green-50 text-green-600"
                />

                <StatCard
                    title="Bị khóa"
                    value={blockedUsers}
                    icon={<UserX size={22} />}
                    iconClass="bg-red-50 text-red-600"
                />

                <StatCard
                    title="Quản trị viên"
                    value={adminUsers}
                    icon={<ShieldCheck size={22} />}
                    iconClass="bg-purple-50 text-purple-600"
                />

            </div>


            {/* DANH SÁCH */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* TOOLBAR */}
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Danh sách người dùng
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {filteredUsers.length} người dùng
                        </p>
                    </div>


                    <div className="relative w-full md:w-80">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Tìm tên hoặc email..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>


                {/* LOADING */}
                {loading ? (
                    <div className="flex h-80 items-center justify-center">
                        <Loader2
                            size={30}
                            className="animate-spin text-blue-600"
                        />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex h-80 flex-col items-center justify-center">
                        <Users
                            size={40}
                            className="text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            Không tìm thấy người dùng
                        </p>
                    </div>
                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead className="bg-slate-50">

                                <tr className="border-b border-slate-200">

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Người dùng
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Email
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                                        Vai trò
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                                        Trạng thái
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Ngày tạo
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                                        Thao tác
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.map((user) => {

                                    const isAdmin =
                                        Number(user.vaitro) === 1;

                                    const isActive =
                                        Number(user.trangthai) === 1;

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >

                                            {/* USER */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    {user.hinhanh ? (
                                                        <img
                                                            src={user.hinhanh}
                                                            alt={user.hoten}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                                                            {user.hoten
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "U"}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-medium text-slate-800">
                                                            {user.hoten}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            ID: {user.id}
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>


                                            {/* EMAIL */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {user.email}
                                            </td>


                                            {/* ROLE */}
                                            <td className="px-5 py-4 text-center">

                                                {isAdmin ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                                        <ShieldCheck size={14} />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                        <Shield size={14} />
                                                        User
                                                    </span>
                                                )}

                                            </td>


                                            {/* STATUS */}
                                            <td className="px-5 py-4 text-center">

                                                {isActive ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                        Bị khóa
                                                    </span>
                                                )}

                                            </td>


                                            {/* DATE */}
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {formatDate(
                                                    user.ngaytao
                                                )}
                                            </td>


                                            {/* ACTION */}
                                            <td className="px-5 py-4 text-center">

                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId === user.id
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            user
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                                                        isActive
                                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                            : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    }`}
                                                >

                                                    {updatingId ===
                                                    user.id ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : isActive ? (
                                                        "Khóa"
                                                    ) : (
                                                        "Mở khóa"
                                                    )}

                                                </button>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}


function StatCard({
    title,
    value,
    icon,
    iconClass,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        {value}
                    </p>
                </div>

                <div
                    className={`rounded-lg p-3 ${iconClass}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}


export default QuanLyNguoiDung;