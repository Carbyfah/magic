"use client";

import { useRouter } from "next/navigation";

const useGoBack = () => {
    const router = useRouter();

    const goBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back(); // Regresa a la página anterior
        } else {
            router.push("/"); // Redirige al home si no hay historial
        }
    };

    return goBack;
};

export default useGoBack;
