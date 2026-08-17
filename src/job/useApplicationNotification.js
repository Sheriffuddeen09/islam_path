import { useCallback, useEffect, useState } from "react";
import api from "../Api/axios";


export default function useApplicationNotification() {

    const [applicationCount, setApplicationCount] =
        useState(0);

    const [loading, setLoading] =
        useState(false);


    const fetchApplicationCount = useCallback(
        async () => {

            try {

                setLoading(true);

                const response = await api.get(
                    "/api/job-applications/unread-count"
                );

                setApplicationCount(
                    response.data.count || 0
                );

            } catch (error) {

                console.error(
                    "APPLICATION COUNT ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    const markApplicationsAsRead = async () => {

        try {

            await api.post(
                "/api/job-applications/mark-read"
            );

            setApplicationCount(0);

        } catch (error) {

            console.error(
                "MARK APPLICATIONS READ ERROR:",
                error
            );

        }

    };


    useEffect(() => {

        fetchApplicationCount();

    }, [fetchApplicationCount]);


    return {
        applicationCount,
        loading,
        fetchApplicationCount,
        markApplicationsAsRead,
    };

}