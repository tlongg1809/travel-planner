import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import {
    getMyGroups,
     requestJoinGroup,
} from "../../services/groupService";

export default function GroupSchedules() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openJoin, setOpenJoin] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        fetchGroups();
    }, [isAuthenticated, user]);

    const fetchGroups = async () => {
        setLoading(true);

        try {
            const res = await getMyGroups(user.id);
            setGroups(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách nhóm:",
                error
            );
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

   const handleJoin = async (e) => {
        e.preventDefault();

        if (!roomCode.trim()) {
            alert("Vui lòng nhập mã phòng");
            return;
        }

        setJoining(true);

        try {
            const res = await requestJoinGroup(
                roomCode.trim().toUpperCase(),
                user.id
            );

            setRoomCode("");
            setOpenJoin(false);

            alert(
                res.data?.message ||
                "Đã gửi yêu cầu tham gia. Vui lòng chờ chủ phòng duyệt."
            );

            await fetchGroups();

        } catch (error) {
            console.error(
                "Lỗi gửi yêu cầu tham gia:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể gửi yêu cầu tham gia"
            );
        } finally {
            setJoining(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="p-8 text-center text-gray-500">
                    Vui lòng đăng nhập để xem lịch trình nhóm.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-6">

                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Lịch trình nhóm
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Các lịch trình nhóm bạn đang tham gia.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setOpenJoin(true)
                        }
                        className="rounded-xl bg-orange-500 px-5 py-3 font-medium text-white transition hover:bg-orange-600"
                    >
                        + Tham gia bằng mã
                    </button>
                </div>

                {/* JOIN FORM */}
                {openJoin && (
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Tham gia lịch trình nhóm
                            </h2>

                            <button
                                onClick={() =>
                                    setOpenJoin(false)
                                }
                                className="text-gray-400 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleJoin}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <input
                                value={roomCode}
                                onChange={(e) =>
                                    setRoomCode(
                                        e.target.value.toUpperCase()
                                    )
                                }
                                placeholder="Nhập mã phòng, ví dụ: A1B2C3D4"
                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 uppercase outline-none focus:border-orange-500"
                            />

                            <button
                                type="submit"
                                disabled={joining}
                                className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {joining
                                    ? "Đang tham gia..."
                                    : "Tham gia"}
                            </button>
                        </form>
                    </div>
                )}

                {/* LIST */}
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        Đang tải nhóm...
                    </div>
                ) : groups.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                        <div className="mb-4 text-6xl">
                            👥
                        </div>

                        <h2 className="font-semibold text-gray-800">
                            Bạn chưa tham gia nhóm nào
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Nhập mã phòng để tham gia lịch trình cùng bạn bè.
                        </p>

                        <button
                            onClick={() =>
                                setOpenJoin(true)
                            }
                            className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            Nhập mã phòng
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {groups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() =>
                                    navigate(
                                        `/group-schedules/${group.id}`
                                    )
                                }
                                className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="mb-4 flex items-start justify-between gap-3">

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {group.tennhom}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {group.tieude}
                                        </p>
                                    </div>

                                    {Number(group.chuphongid) ===
                                        Number(user.id) && (
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                                            Host
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        👑 Chủ phòng:{" "}
                                        <span className="font-medium">
                                            {group.tenchu}
                                        </span>
                                    </p>

                                    <p>
                                        📅{" "}
                                        {String(
                                            group.ngaybatdau
                                        ).slice(0, 10)}
                                        {" → "}
                                        {String(
                                            group.ngayketthuc
                                        ).slice(0, 10)}
                                    </p>

                                    <p>
                                        💰{" "}
                                        {Number(
                                            group.tongtien || 0
                                        ).toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </p>

                                    <p>
                                        🔑 Mã phòng:{" "}
                                        <span className="font-semibold tracking-widest text-orange-500">
                                            {group.roomcode}
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-5 text-sm font-medium text-orange-500">
                                    Xem lịch trình →
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}