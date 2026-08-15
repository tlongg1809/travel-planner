import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MessageSquare,
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  User,
  MapPin,
  CalendarDays,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   HELPER
   ========================================================= */

function formatDate(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


/* =========================================================
   TOAST
   ========================================================= */

function Toast({ open, message, variant = "success", onClose }) {
  if (!open) return null;

  const success = variant === "success";

  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
          success ? "border-emerald-200" : "border-red-200"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            success
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {success ? (
            <CheckCircle size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              success ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   RATING STARS
   ========================================================= */

function RatingStars({ value }) {
  const rating = Number(value || 0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300"
          }
        />
      ))}

      <span className="ml-1 text-sm font-medium text-slate-600">
        {rating}/5
      </span>
    </div>
  );
}


/* =========================================================
   COMMENT STATUS
   ========================================================= */

function CommentStatusBadge({ status }) {
  const active = Number(status) === 1;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? <Eye size={13} /> : <EyeOff size={13} />}

      {active ? "Đang hiển thị" : "Đã ẩn"}
    </span>
  );
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {type === "comment" ? (
          <MessageSquare size={26} />
        ) : (
          <Star size={26} />
        )}
      </div>

      <h3 className="font-semibold text-slate-700">
        Không có dữ liệu
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Chưa có dữ liệu phù hợp với điều kiện tìm kiếm.
      </p>
    </div>
  );
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function QuanLyBinhLuan() {
  const [activeTab, setActiveTab] = useState("comments");

  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [errorComments, setErrorComments] = useState("");
  const [errorReviews, setErrorReviews] = useState("");

  const [search, setSearch] = useState("");

  const [commentStatus, setCommentStatus] = useState("all");

  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    variant: "success",
  });


  /* =========================================================
     TOAST
     ========================================================= */

  const showToast = (message, variant = "success") => {
    setToast({
      open: true,
      message,
      variant,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);
  };


  /* =========================================================
     GET COMMENTS
     ========================================================= */

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      setErrorComments("");

      const response = await fetch(`${API_URL}/comments`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách bình luận.");
      }

      const data = await response.json();

      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);

      setErrorComments(
        error.message || "Không thể tải danh sách bình luận."
      );
    } finally {
      setLoadingComments(false);
    }
  };


  /* =========================================================
     GET REVIEWS
     ========================================================= */

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      setErrorReviews("");

      const response = await fetch(`${API_URL}/reviews`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách đánh giá.");
      }

      const data = await response.json();

      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);

      setErrorReviews(
        error.message || "Không thể tải danh sách đánh giá."
      );
    } finally {
      setLoadingReviews(false);
    }
  };


  /* =========================================================
     LOAD DATA
     ========================================================= */

  useEffect(() => {
    fetchComments();
    fetchReviews();
  }, []);


  /* =========================================================
     CHANGE COMMENT STATUS
     ========================================================= */

  const handleChangeCommentStatus = async (comment) => {
    try {
      const currentStatus = Number(comment.trangthai);

      const newStatus = currentStatus === 1 ? 0 : 1;

      const response = await fetch(
        `${API_URL}/comments/${comment.id}/status`,
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
          data.message || "Không thể cập nhật trạng thái bình luận."
        );
      }

      setComments((prev) =>
        prev.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                trangthai: newStatus,
              }
            : item
        )
      );

      setSelectedComment(null);

      showToast(
        newStatus === 1
          ? "Đã duyệt bình luận."
          : "Đã ẩn bình luận."
      );
    } catch (error) {
      console.error(
        "Lỗi cập nhật trạng thái bình luận:",
        error
      );

      showToast(
        error.message || "Không thể cập nhật bình luận.",
        "error"
      );
    }
  };


  /* =========================================================
     FILTER COMMENTS
     ========================================================= */

  const filteredComments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return comments.filter((comment) => {
      const matchesSearch =
        !keyword ||
        String(comment.hoten || "")
          .toLowerCase()
          .includes(keyword) ||
        String(comment.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(comment.tendiadiem || "")
          .toLowerCase()
          .includes(keyword) ||
        String(comment.noidung || "")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        commentStatus === "all" ||
        Number(comment.trangthai) === Number(commentStatus);

      return matchesSearch && matchesStatus;
    });
  }, [comments, search, commentStatus]);


  /* =========================================================
     FILTER REVIEWS
     ========================================================= */

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      return (
        !keyword ||
        String(review.hoten || "")
          .toLowerCase()
          .includes(keyword) ||
        String(review.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(review.tendiadiem || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [reviews, search]);


  /* =========================================================
     REFRESH
     ========================================================= */

  const handleRefresh = () => {
    if (activeTab === "comments") {
      fetchComments();
    } else {
      fetchReviews();
    }
  };


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="space-y-5">
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Quản lý bình luận & đánh giá
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Quản lý bình luận của người dùng và theo dõi đánh giá
          tại các địa điểm.
        </p>
      </div>


      {/* =====================================================
          TAB
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("comments");
                setSearch("");
              }}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "comments"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <MessageSquare size={17} />

              Bình luận

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "comments"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {comments.length}
              </span>
            </button>


            <button
              type="button"
              onClick={() => {
                setActiveTab("reviews");
                setSearch("");
              }}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "reviews"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Star size={17} />

              Đánh giá

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "reviews"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {reviews.length}
              </span>
            </button>
          </div>


          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              activeTab === "comments"
                ? loadingComments
                : loadingReviews
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                activeTab === "comments"
                  ? loadingComments
                    ? "animate-spin"
                    : ""
                  : loadingReviews
                  ? "animate-spin"
                  : ""
              }
            />

            Làm mới
          </button>
        </div>


        {/* =====================================================
            SEARCH + FILTER
            ===================================================== */}

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_220px]">

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                activeTab === "comments"
                  ? "Tìm theo người dùng, địa điểm, nội dung..."
                  : "Tìm theo người dùng hoặc địa điểm..."
              }
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>


          {activeTab === "comments" && (
            <select
              value={commentStatus}
              onChange={(event) =>
                setCommentStatus(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="1">
                Đang hiển thị
              </option>

              <option value="0">
                Đã ẩn
              </option>
            </select>
          )}
        </div>
      </div>


      {/* =====================================================
          COMMENTS
          ===================================================== */}

      {activeTab === "comments" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {loadingComments ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Đang tải bình luận...
              </div>
            </div>
          ) : errorComments ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={24} />
              </div>

              <h3 className="font-semibold text-slate-700">
                Không thể tải bình luận
              </h3>

              <p className="mt-1 text-sm text-red-500">
                {errorComments}
              </p>

              <button
                type="button"
                onClick={fetchComments}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Thử lại
              </button>
            </div>
          ) : filteredComments.length === 0 ? (
            <EmptyState type="comment" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Người dùng
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Địa điểm
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nội dung
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ngày tạo
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Trạng thái
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Thao tác
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredComments.map((comment) => (

                    <tr
                      key={comment.id}
                      className="transition hover:bg-blue-50/40"
                    >

                      {/* USER */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <User size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                              {comment.hoten ||
                                "Người dùng"}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-400">
                              {comment.email || ""}
                            </p>
                          </div>

                        </div>
                      </td>


                      {/* PLACE */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">

                          <MapPin
                            size={15}
                            className="shrink-0 text-blue-500"
                          />

                          <span className="max-w-[190px] truncate text-sm font-medium text-slate-700">
                            {comment.tendiadiem ||
                              "Chưa cập nhật"}
                          </span>

                        </div>
                      </td>


                      {/* CONTENT */}

                      <td className="px-4 py-4">
                        <p className="max-w-[300px] truncate text-sm text-slate-600">
                          {comment.noidung ||
                            "Không có nội dung"}
                        </p>
                      </td>


                      {/* DATE */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays size={14} />

                          {formatDate(comment.ngaytao)}

                        </div>
                      </td>


                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <CommentStatusBadge
                          status={comment.trangthai}
                        />
                      </td>


                      {/* ACTION */}

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            title="Xem bình luận"
                            onClick={() =>
                              setSelectedComment(comment)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            Xem
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleChangeCommentStatus(
                                comment
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white ${
                              Number(comment.trangthai) ===
                              1
                                ? "bg-slate-600 hover:bg-slate-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {Number(comment.trangthai) ===
                            1 ? (
                              <>
                                <EyeOff size={14} />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Duyệt
                              </>
                            )}
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            </div>
          )}
        </div>
      )}


      {/* =====================================================
          REVIEWS
          ===================================================== */}

      {activeTab === "reviews" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {loadingReviews ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Đang tải đánh giá...
              </div>
            </div>
          ) : errorReviews ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={24} />
              </div>

              <h3 className="font-semibold text-slate-700">
                Không thể tải đánh giá
              </h3>

              <p className="mt-1 text-sm text-red-500">
                {errorReviews}
              </p>

              <button
                type="button"
                onClick={fetchReviews}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Thử lại
              </button>

            </div>
          ) : filteredReviews.length === 0 ? (
            <EmptyState type="review" />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Người dùng
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Địa điểm
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Số sao
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ngày đánh giá
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Thao tác
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredReviews.map((review) => (

                    <tr
                      key={review.id}
                      className="transition hover:bg-blue-50/40"
                    >

                      {/* USER */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                            <User size={17} />
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                              {review.hoten ||
                                "Người dùng"}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-400">
                              {review.email || ""}
                            </p>

                          </div>

                        </div>
                      </td>


                      {/* PLACE */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={15}
                            className="shrink-0 text-blue-500"
                          />

                          <span className="max-w-[250px] truncate text-sm font-medium text-slate-700">
                            {review.tendiadiem ||
                              "Chưa cập nhật"}
                          </span>

                        </div>

                      </td>


                      {/* RATING */}

                      <td className="px-4 py-4">

                        <RatingStars
                          value={review.sosao}
                        />

                      </td>


                      {/* DATE */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays size={14} />

                          {formatDate(review.ngaytao)}

                        </div>

                      </td>


                      {/* ACTION */}

                      <td className="px-4 py-4">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            title="Xem đánh giá"
                            onClick={() =>
                              setSelectedReview(review)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            Xem
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}


      {/* =====================================================
          COMMENT DETAIL MODAL
          ===================================================== */}

      {selectedComment && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <h2 className="font-semibold text-slate-800">
                  Chi tiết bình luận
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  ID bình luận: #{selectedComment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedComment(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>


            <div className="space-y-4 p-5">

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Người dùng
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedComment.hoten ||
                    "Người dùng"}
                </p>

                <p className="text-xs text-slate-400">
                  {selectedComment.email || ""}
                </p>
              </div>


              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Địa điểm
                </p>

                <p className="text-sm font-medium text-slate-800">
                  {selectedComment.tendiadiem ||
                    "Chưa cập nhật"}
                </p>
              </div>


              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Nội dung
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedComment.noidung ||
                    "Không có nội dung"}
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Ngày tạo
                  </p>

                  <p className="text-sm text-slate-700">
                    {formatDate(
                      selectedComment.ngaytao
                    )}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Trạng thái
                  </p>

                  <CommentStatusBadge
                    status={
                      selectedComment.trangthai
                    }
                  />
                </div>

              </div>

            </div>


            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedComment(null)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>


              <button
                type="button"
                onClick={() =>
                  handleChangeCommentStatus(
                    selectedComment
                  )
                }
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  Number(selectedComment.trangthai) ===
                  1
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {Number(selectedComment.trangthai) ===
                1 ? (
                  <>
                    <EyeOff size={16} />
                    Ẩn bình luận
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Duyệt bình luận
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}


      {/* =====================================================
          REVIEW DETAIL MODAL
          ===================================================== */}

      {selectedReview && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <h2 className="font-semibold text-slate-800">
                  Chi tiết đánh giá
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  ID đánh giá: #{selectedReview.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>


            <div className="space-y-5 p-5">

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Người dùng
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedReview.hoten ||
                    "Người dùng"}
                </p>

                <p className="text-xs text-slate-400">
                  {selectedReview.email || ""}
                </p>
              </div>


              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Địa điểm
                </p>

                <p className="text-sm font-medium text-slate-800">
                  {selectedReview.tendiadiem ||
                    "Chưa cập nhật"}
                </p>
              </div>


              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">
                  Đánh giá
                </p>

                <div className="rounded-lg bg-slate-50 p-4">
                  <RatingStars
                    value={selectedReview.sosao}
                  />
                </div>
              </div>


              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Ngày đánh giá
                </p>

                <p className="text-sm text-slate-700">
                  {formatDate(selectedReview.ngaytao)}
                </p>
              </div>

            </div>


            <div className="flex justify-end border-t border-slate-200 px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(null)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default QuanLyBinhLuan;