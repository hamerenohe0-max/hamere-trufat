"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dailyReadingsApi, CreateDailyReadingDto, DailyReading } from "../services/daily-readings.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AudioUpload } from "@/components/ui/AudioUpload";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DailyReadingsForm() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState<'Morning' | 'Evening'>('Morning');
  
  const [formData, setFormData] = useState<CreateDailyReadingDto>({
    date: date,
    timeOfDay: "Morning",
    
    gospelGeez: "",
    gospelAmharic: "",
    gospelAudioUrl: "",
    gospelRef: "",

    epistleGeez: "",
    epistleAmharic: "",
    epistleRef: "",
    
    psalmGeez: "",
    psalmAmharic: "",
    psalmAudioUrl: "",
    psalmRef: "",

    actsGeez: "",
    actsAmharic: "",
    actsRef: "",
  });

  const { data: readings, isLoading } = useQuery({
    queryKey: ["daily-readings", date],
    queryFn: () => dailyReadingsApi.getByDate(date),
  });

  // Load data for the active tab (Time of Day)
  useEffect(() => {
    if (readings && Array.isArray(readings)) {
      const reading = readings.find(r => r.timeOfDay === activeTab);
      
      if (reading) {
        setFormData({
            date: reading.date,
            timeOfDay: reading.timeOfDay,
            
            gospelGeez: reading.gospelGeez || "",
            gospelAmharic: reading.gospelAmharic || "",
            gospelAudioUrl: reading.gospelAudioUrl || "",
            gospelRef: reading.gospelRef || "",
            
            epistleGeez: reading.epistleGeez || "",
            epistleAmharic: reading.epistleAmharic || "",
            epistleRef: reading.epistleRef || "",
            
            psalmGeez: reading.psalmGeez || "",
            psalmAmharic: reading.psalmAmharic || "",
            psalmAudioUrl: reading.psalmAudioUrl || "",
            psalmRef: reading.psalmRef || "",

            actsGeez: reading.actsGeez || "",
            actsAmharic: reading.actsAmharic || "",
            actsRef: reading.actsRef || "",
        });
      } else {
         // Reset if no reading for this time
         resetForm(activeTab);
      }
    } else {
        resetForm(activeTab);
    }
  }, [readings, date, activeTab]);

  const resetForm = (time: 'Morning' | 'Evening') => {
    setFormData({
         date: date,
         timeOfDay: time,
         gospelGeez: "", gospelAmharic: "", gospelAudioUrl: "", gospelRef: "",
         epistleGeez: "", epistleAmharic: "", epistleRef: "",
         psalmGeez: "", psalmAmharic: "", psalmAudioUrl: "", psalmRef: "",
         actsGeez: "", actsAmharic: "", actsRef: "",
    });
  }

  const updateMutation = useMutation({
    mutationFn: (data: CreateDailyReadingDto) => dailyReadingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-readings", date] });
      toast.success(`${activeTab} reading saved successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save daily reading");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ ...formData, date, timeOfDay: activeTab });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <label className="font-medium">Select Date:</label>
        <Input 
          type="date" 
          value={date} 
          onChange={handleDateChange}
          className="w-48"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="Morning">Morning Prayer</TabsTrigger>
          <TabsTrigger value="Evening">Evening/Afternoon Prayer</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Gospel Section */}
          <div className="space-y-4 border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold border-b pb-2">Gospel</h3>
            <div className="space-y-2">
               <label className="text-sm font-medium">Reference (Book Ch:Ver)</label>
               <Input 
                 placeholder="e.g. Matthew 5:1-12"
                 value={formData.gospelRef}
                 onChange={(e) => setFormData(prev => ({ ...prev, gospelRef: e.target.value }))}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geez Text</label>
                <Textarea
                  rows={5}
                  value={formData.gospelGeez}
                  onChange={(e) => setFormData(prev => ({ ...prev, gospelGeez: e.target.value }))}
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amharic Text</label>
                <Textarea
                  rows={5}
                  value={formData.gospelAmharic}
                  onChange={(e) => setFormData(prev => ({ ...prev, gospelAmharic: e.target.value }))}
                  dir="auto"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Recording</label>
              <AudioUpload
                value={formData.gospelAudioUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, gospelAudioUrl: url || "" }))}
                folder="hamere-trufat/audio/gospel"
              />
            </div>
          </div>

          {/* Epistle Section - NO AUDIO as requested */}
          <div className="space-y-4 border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold border-b pb-2">Epistle</h3>
            <div className="space-y-2">
               <label className="text-sm font-medium">Reference (Book Ch:Ver)</label>
               <Input 
                 placeholder="e.g. Romans 1:1-7"
                 value={formData.epistleRef}
                 onChange={(e) => setFormData(prev => ({ ...prev, epistleRef: e.target.value }))}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geez Text</label>
                <Textarea
                  rows={5}
                  value={formData.epistleGeez}
                  onChange={(e) => setFormData(prev => ({ ...prev, epistleGeez: e.target.value }))}
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amharic Text</label>
                <Textarea
                  rows={5}
                  value={formData.epistleAmharic}
                  onChange={(e) => setFormData(prev => ({ ...prev, epistleAmharic: e.target.value }))}
                  dir="auto"
                />
              </div>
            </div>
          </div>

          {/* Acts Section - NEW */}
          <div className="space-y-4 border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold border-b pb-2">Acts of the Apostles</h3>
            <div className="space-y-2">
               <label className="text-sm font-medium">Reference (Book Ch:Ver)</label>
               <Input 
                 placeholder="e.g. Acts 2:1-4"
                 value={formData.actsRef}
                 onChange={(e) => setFormData(prev => ({ ...prev, actsRef: e.target.value }))}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geez Text</label>
                <Textarea
                  rows={5}
                  value={formData.actsGeez}
                  onChange={(e) => setFormData(prev => ({ ...prev, actsGeez: e.target.value }))}
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amharic Text</label>
                <Textarea
                  rows={5}
                  value={formData.actsAmharic}
                  onChange={(e) => setFormData(prev => ({ ...prev, actsAmharic: e.target.value }))}
                  dir="auto"
                />
              </div>
            </div>
          </div>

          {/* Psalms Section */}
          <div className="space-y-4 border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold border-b pb-2">Psalms</h3>
            <div className="space-y-2">
               <label className="text-sm font-medium">Reference (Book Ch:Ver)</label>
               <Input 
                 placeholder="e.g. Psalms 23"
                 value={formData.psalmRef}
                 onChange={(e) => setFormData(prev => ({ ...prev, psalmRef: e.target.value }))}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geez Text</label>
                <Textarea
                  rows={5}
                  value={formData.psalmGeez}
                  onChange={(e) => setFormData(prev => ({ ...prev, psalmGeez: e.target.value }))}
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amharic Text</label>
                <Textarea
                  rows={5}
                  value={formData.psalmAmharic}
                  onChange={(e) => setFormData(prev => ({ ...prev, psalmAmharic: e.target.value }))}
                  dir="auto"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Recording</label>
              <AudioUpload
                value={formData.psalmAudioUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, psalmAudioUrl: url || "" }))}
                folder="hamere-trufat/audio/psalms"
              />
            </div>
          </div>

          <div className="pt-4 sticky bottom-4">
            <Button type="submit" size="lg" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : `Save ${activeTab} Reading`}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
