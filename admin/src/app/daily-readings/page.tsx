"use client";

import { DailyReadingsForm } from "@/features/daily-readings/components/DailyReadingsForm";

export default function DailyReadingsPage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Daily Readings & Prayers</h1>
                <p className="text-gray-500 mt-2">
                    Manage daily Gospel, Epistle, and Psalm readings. Upload audio recordings and input text translations.
                </p>
            </div>
            <DailyReadingsForm />
        </div>
    );
}
