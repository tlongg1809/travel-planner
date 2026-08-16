import {
    MapPin,
    Heart,
    CalendarDays,
    Users,
    Compass,
    Star,
    Map,
    ShieldCheck
} from "lucide-react";

import Layout from "../../components/Layout/Layout";

export default function About() {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">

                {/* ================= HERO ================= */}
                <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-300 px-10 py-16">
                    <div className="mx-auto max-w-6xl text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                            <Compass
                                size={40}
                                className="text-orange-500"
                            />
                        </div>

                        <h1 className="mt-6 text-4xl font-bold text-white">
                            Về Travel Planner
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/90">
                            Travel Planner giúp bạn khám phá những địa điểm
                            thú vị, lưu lại nơi yêu thích và dễ dàng xây dựng
                            lịch trình cho chuyến đi của mình.
                        </p>

                    </div>
                </section>


                {/* ================= GIỚI THIỆU ================= */}
                <section className="mx-auto max-w-6xl px-10 py-14">

                    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                                Khám phá • Lên kế hoạch • Trải nghiệm
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-gray-900">
                                Đồng hành cùng bạn trong mỗi chuyến đi
                            </h2>

                            <p className="mt-5 leading-7 text-gray-600">
                                Travel Planner được xây dựng với mục tiêu giúp
                                việc lên kế hoạch du lịch trở nên đơn giản và
                                thuận tiện hơn.
                            </p>

                            <p className="mt-4 leading-7 text-gray-600">
                                Bạn có thể tìm kiếm địa điểm ăn uống, khách sạn,
                                homestay, địa điểm vui chơi và nhiều địa điểm
                                thú vị khác tại Cần Thơ.
                            </p>

                            <p className="mt-4 leading-7 text-gray-600">
                                Sau khi tìm được địa điểm phù hợp, bạn có thể
                                lưu địa điểm yêu thích và thêm chúng vào lịch
                                trình để chuẩn bị cho chuyến đi của mình.
                            </p>
                        </div>


                        <div className="grid grid-cols-2 gap-4">

                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <MapPin
                                    size={30}
                                    className="text-orange-500"
                                />

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Khám phá địa điểm
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Tìm kiếm và khám phá những địa điểm phù hợp
                                    với nhu cầu của bạn.
                                </p>
                            </div>


                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <Heart
                                    size={30}
                                    className="text-red-500"
                                />

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Lưu yêu thích
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Lưu lại những địa điểm bạn muốn ghé thăm.
                                </p>
                            </div>


                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <CalendarDays
                                    size={30}
                                    className="text-blue-500"
                                />

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Tạo lịch trình
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Sắp xếp các địa điểm thành lịch trình cho
                                    chuyến đi.
                                </p>
                            </div>


                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <Map
                                    size={30}
                                    className="text-green-500"
                                />

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Xem bản đồ
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Xem vị trí và hỗ trợ định hướng đến địa điểm.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= TÍNH NĂNG ================= */}
                <section className="bg-white px-10 py-14">

                    <div className="mx-auto max-w-6xl">

                        <div className="text-center">

                            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                                Travel Planner
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                Những gì bạn có thể làm
                            </h2>

                            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
                                Mọi công cụ cần thiết để bạn chuẩn bị cho một
                                chuyến đi thuận tiện hơn.
                            </p>

                        </div>


                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">

                            {/* CARD 1 */}
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                                    <Compass
                                        size={25}
                                        className="text-orange-500"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-gray-900">
                                    Khám phá
                                </h3>

                                <p className="mt-3 leading-7 text-gray-500">
                                    Khám phá các địa điểm nổi bật theo nhu cầu
                                    như ăn uống, khách sạn, homestay, check-in
                                    và vui chơi.
                                </p>

                            </div>


                            {/* CARD 2 */}
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                    <CalendarDays
                                        size={25}
                                        className="text-blue-500"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-gray-900">
                                    Lên lịch trình
                                </h3>

                                <p className="mt-3 leading-7 text-gray-500">
                                    Tạo lịch trình riêng, thêm các địa điểm
                                    mong muốn và quản lý chuyến đi một cách
                                    thuận tiện.
                                </p>

                            </div>


                            {/* CARD 3 */}
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                                    <Users
                                        size={25}
                                        className="text-green-500"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-gray-900">
                                    Du lịch cùng nhóm
                                </h3>

                                <p className="mt-3 leading-7 text-gray-500">
                                    Tạo và tham gia lịch trình nhóm để cùng
                                    bạn bè lên kế hoạch cho chuyến đi.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= GIÁ TRỊ ================= */}
                <section className="mx-auto max-w-6xl px-10 py-14">

                    <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">

                        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

                            <div className="text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                                    <Star
                                        size={28}
                                        className="fill-orange-500 text-orange-500"
                                    />
                                </div>

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Trải nghiệm tốt hơn
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Giúp bạn dễ dàng tìm kiếm và lựa chọn địa
                                    điểm phù hợp.
                                </p>

                            </div>


                            <div className="text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                                    <Users
                                        size={28}
                                        className="text-blue-500"
                                    />
                                </div>

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Kết nối
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Cùng bạn bè xây dựng những lịch trình du
                                    lịch đáng nhớ.
                                </p>

                            </div>


                            <div className="text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                    <ShieldCheck
                                        size={28}
                                        className="text-green-500"
                                    />
                                </div>

                                <h3 className="mt-4 font-bold text-gray-900">
                                    Tiện lợi
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Tập trung các công cụ cần thiết trong một
                                    nền tảng.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= CTA ================= */}
                <section className="px-10 pb-16">

                    <div className="mx-auto max-w-6xl rounded-3xl bg-orange-500 px-8 py-12 text-center">

                        <h2 className="text-3xl font-bold text-white">
                            Sẵn sàng khám phá Cần Thơ?
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-white/90">
                            Bắt đầu tìm kiếm địa điểm và xây dựng lịch trình
                            cho chuyến đi tiếp theo của bạn.
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.href = "/explore"}
                            className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-orange-500 transition hover:bg-gray-100"
                        >
                            Khám phá ngay
                        </button>

                    </div>

                </section>

            </div>
        </Layout>
    );
}