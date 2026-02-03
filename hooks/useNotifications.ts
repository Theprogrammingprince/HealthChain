"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function useNotifications() {
    const { supabaseUser } = useAppStore();

    useEffect(() => {
        if (!supabaseUser) return;

        // Subscribe to real-time notifications for this user
        const channel = supabase
            .channel(`public:notifications:user_id=eq.${supabaseUser.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${supabaseUser.id}`,
                },
                (payload) => {
                    const newNotification = payload.new;
                    console.log("New notification received:", newNotification);

                    // Show a toast for the new notification
                    toast(newNotification.title, {
                        description: newNotification.message,
                        action: newNotification.action_link ? {
                            label: "View",
                            onClick: () => window.location.href = newNotification.action_link
                        } : undefined
                    });

                    // Trigger a custom event that components can listen to
                    const event = new CustomEvent("new_notification", { detail: newNotification });
                    window.dispatchEvent(event);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabaseUser]);
}
