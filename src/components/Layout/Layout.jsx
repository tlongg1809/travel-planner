import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
    children,

    selectedCity: externalSelectedCity,
    setSelectedCity: externalSetSelectedCity,

    selectedDistrict: externalSelectedDistrict,
    setSelectedDistrict: externalSetSelectedDistrict
}) {

    // ==========================================
    // STATE MẶC ĐỊNH CHO CÁC TRANG KHÔNG TRUYỀN
    // ==========================================

    const [internalSelectedCity, setInternalSelectedCity] =
        useState("");

    const [internalSelectedDistrict, setInternalSelectedDistrict] =
        useState("");

    const [collapsed, setCollapsed] =
        useState(false);


    // ==========================================
    // DÙNG STATE TỪ TRANG CHA NẾU CÓ
    // KHÔNG CÓ THÌ DÙNG STATE CỦA LAYOUT
    // ==========================================

    const selectedCity =
        externalSelectedCity !== undefined
            ? externalSelectedCity
            : internalSelectedCity;

    const setSelectedCity =
        externalSetSelectedCity ||
        setInternalSelectedCity;


    const selectedDistrict =
        externalSelectedDistrict !== undefined
            ? externalSelectedDistrict
            : internalSelectedDistrict;

    const setSelectedDistrict =
        externalSetSelectedDistrict ||
        setInternalSelectedDistrict;


    return (

        <div className="flex h-screen bg-gray-100">

            {/* SIDEBAR */}

            <Sidebar
                collapsed={collapsed}
            />


            {/* MAIN */}

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* HEADER */}

                <Header

                    collapsed={collapsed}

                    setCollapsed={setCollapsed}

                    selectedCity={selectedCity}

                    setSelectedCity={setSelectedCity}

                    selectedDistrict={selectedDistrict}

                    setSelectedDistrict={setSelectedDistrict}

                />


                {/* CONTENT */}

                <main className="flex-1 overflow-y-auto">

                    {children}

                </main>

            </div>

        </div>

    );
}