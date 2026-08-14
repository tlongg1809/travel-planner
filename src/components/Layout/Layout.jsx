import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";


export default function Layout({

    children,

    selectedCity,
    setSelectedCity,

    selectedDistrict,
    setSelectedDistrict

}) {

    const [collapsed, setCollapsed] = useState(false);


    return (

        <div className="flex h-screen bg-gray-100">


            {/* =========================
                SIDEBAR
            ========================= */}

            <Sidebar

                collapsed={collapsed}

            />


            {/* =========================
                MAIN
            ========================= */}

            <div className="flex-1 flex flex-col overflow-hidden">


                {/* =========================
                    HEADER
                ========================= */}

                <Header

                    collapsed={collapsed}

                    setCollapsed={setCollapsed}

                    selectedCity={selectedCity}

                    setSelectedCity={setSelectedCity}

                    selectedDistrict={selectedDistrict}

                    setSelectedDistrict={setSelectedDistrict}

                />


                {/* =========================
                    CONTENT
                ========================= */}

                <main className="flex-1 overflow-y-auto">

                    {children}

                </main>


            </div>

        </div>

    );
}