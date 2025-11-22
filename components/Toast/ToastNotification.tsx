"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";
export type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ToastProps = {
    show: boolean;
    message: string;
    type?: ToastType;
    position?: ToastPosition;
    duration?: number; // ms, default 3500
    onClose?: () => void;
};

export function ToastNotification({ show, message, type = "info", position = "bottom-right", duration = 3500, onClose }: ToastProps) {
    // Auto-hide dopo "duration"
    useEffect(() => {
        if (!show) return;
        if (!onClose) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div className={`toast-container toast-${position}`} aria-live="polite">
            <div className={`toast toast-${type}`}>
                <span className="toast-dot" />
                <span className="toast-message">{message}</span>
            </div>
        </div>
    );
}
