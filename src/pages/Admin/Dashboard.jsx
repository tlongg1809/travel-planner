export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Tổng quan hệ thống
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">Tổng địa điểm</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">45</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">Người dùng đăng ký</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">120</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">Bình luận & Đánh giá</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">312</p>
        </div>
      </div>
    </div>
  );
}
