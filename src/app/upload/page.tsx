"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API_URL from "@/lib/api";
import { toast } from "sonner"; // คุณมี sonner ใน package.json แล้ว

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        // ไม่ต้องเซต Header Content-Type เพราะ FormData จะจัดการให้เองรวมถึง boundary
      });

      if (response.ok) {
        toast.success("อัปโหลดสำเร็จ!");
        setTitle("");
        setDescription("");
        setFile(null);
      } else {
        toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>อัปโหลดข้อมูล (1 Metadata : 1 ไฟล์)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">ชื่อรายการ (Title)</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="ระบุชื่อข้อมูล"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">คำอธิบาย (Description)</Label>
              <Input 
                id="desc" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="ระบุรายละเอียดเพิ่มเติม"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">เลือกไฟล์</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังอัปโหลด..." : "บันทึกและอัปโหลด"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}