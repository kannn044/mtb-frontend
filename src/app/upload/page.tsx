"use client";

import API_URL from '@/lib/api';
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, FileArchive, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

// --- Types สำหรับ Location ---
interface Province {
  adm1_name: string; // ชื่อจังหวัด
  adm1_pcode: string; // รหัสจังหวัด (ใช้เชื่อมโยง)
}

interface District {
  adm2_name: string; // ชื่ออำเภอ
  adm2_pcode: string;
}

// Config สำหรับ Field อื่นๆ (ตัด Province, District, Collection Date ออกมาจัดการแยก)
const GENERAL_FIELDS = [
  { key: "patient_id", label: "Patient ID", placeholder: "e.g. 9, 10, 11", type: "text" },
  { key: "sample_id", label: "Sample ID", placeholder: "e.g. ERR718192", type: "text" },
  // collection_date จัดการแยก
  // province จัดการแยก
  // district จัดการแยก
  { key: "sex", label: "Sex", type: "select", options: ["Male", "Female"] },
  { key: "age", label: "Age", placeholder: "e.g. 58", type: "number" },
  { key: "ethnic_group", label: "Ethnic Group", placeholder: "e.g. Lahu, Thailand", type: "text" },
  { key: "education", label: "Education", placeholder: "e.g. No formal education", type: "text" },
  { key: "occupation", label: "Occupation", placeholder: "e.g. Unemployed", type: "text" },
  { key: "chest_x_ray", label: "Chest X-ray", placeholder: "e.g. Cavity", type: "text" },
  { key: "treatment_outcome", label: "Treatment Outcome", placeholder: "e.g. Cure/complete", type: "text" },
];

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // State สำหรับเก็บไฟล์
  const [files, setFiles] = useState<File[]>([]);
  
  // State ข้อมูล Form
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  
  // State สำหรับ Dropdown Location
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [selectedPcode, setSelectedPcode] = useState<string>(""); // เก็บ pcode เพื่อใช้ดึง district

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Fetch Provinces เมื่อเริ่มหน้าเว็บ ---
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        // TODO: เปลี่ยน URL เป็น API จริงของคุณ เช่น ${API_URL}/api/provinces
        // สมมติโครงสร้างข้อมูลที่ได้: [{ adm1_name: 'Chiang Rai', adm1_pcode: 'TH57' }, ...]
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/upload/provinces`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

        if (res.ok) {
          const data = await res.json();
          setProvinceList(data);
        }
      } catch (error) {
        console.error("Failed to fetch provinces", error);
        // Mock data กรณี fetch ไม่ได้ (เพื่อทดสอบ UI)
        setProvinceList([
            { adm1_name: "Chiang Rai", adm1_pcode: "TH57" },
            { adm1_name: "Chiang Mai", adm1_pcode: "TH50" }
        ]);
      }
    };
    fetchProvinces();
  }, []);

  // --- 2. Fetch Districts เมื่อเลือก Province ---
  useEffect(() => {
    if (!selectedPcode) {
      setDistrictList([]);
      return;
    }

    const fetchDistricts = async () => {
      setIsLocationLoading(true);
      try {
        // TODO: เปลี่ยน URL เป็น API จริง เช่น ${API_URL}/api/districts?pcode=TH57
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/upload/districts?pcode=${selectedPcode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDistrictList(data);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
        // Mock data
        if(selectedPcode === "TH57") {
            setDistrictList([
                { adm2_name: "Mueang Chiang Rai", adm2_pcode: "TH5701" },
                { adm2_name: "Phan", adm2_pcode: "TH5702" }
            ]);
        } else {
            setDistrictList([{ adm2_name: "Other District", adm2_pcode: "9999" }]);
        }
      } finally {
        setIsLocationLoading(false);
      }
    };

    fetchDistricts();
  }, [selectedPcode]);

  // --- Helper: Format Date (YYYY-MM-DD -> 08/Dec/2005) ---
  const formatDateForSubmit = (isoDate: string): string => {
    if (!isoDate) return "NA";
    const date = new Date(isoDate);
    // แปลงเป็นรูปแบบ dd/MMM/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  // Handle Province Change พิเศษ เพราะต้องเก็บ Pcode และ Reset District
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    
    // หา object province เพื่อเอา pcode
    const provinceObj = provinceList.find(p => p.adm1_name === selectedName);
    
    setMetadata(prev => ({
        ...prev, 
        province: selectedName,
        district: "" // Reset district เมื่อเปลี่ยนจังหวัด
    }));
    
    setSelectedPcode(provinceObj ? provinceObj.adm1_pcode : "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.name.toLowerCase().endsWith('.gz'));
      
      if (validFiles.length < selectedFiles.length) {
        toast.warning(`Skipped non-.gz files`);
      }
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("กรุณาอัปโหลดไฟล์ .gz อย่างน้อย 1 ไฟล์");
      return;
    }

    // Validation Basic
    if(!metadata.patient_id || !metadata.sample_id) {
        toast.error("กรุณากรอกข้อมูลสำคัญ (Patient ID, Sample ID)");
        return;
    }

    // เตรียม Metadata ที่จะส่ง (แปลง Date Format ตรงนี้)
    const metadataToSubmit = {
        ...metadata,
        collection_date: formatDateForSubmit(metadata.collection_date || ""),
    };

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("metadata", JSON.stringify(metadataToSubmit));
      files.forEach((file) => formData.append("files", file));      

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
          },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success(`Success! Date saved as: ${metadataToSubmit.collection_date}`);
      
      // Reset Form
      setMetadata({});
      setFiles([]);
      setSelectedPcode("");
      setDistrictList([]);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const labelStyle = "text-sm font-semibold mb-1.5 block text-slate-700";
  const inputStyle = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all";
  const buttonStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 w-full disabled:opacity-50 transition-colors cursor-pointer shadow-sm";

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Patient Data Entry</h1>
      <Card className="w-full max-w-6xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl">Metadata & Sequencing Files (.gz)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* 1. Loop General Fields (Patient ID, Sample ID) */}
              {GENERAL_FIELDS.slice(0, 2).map((field) => (
                 <div key={field.key}>
                    <label className={labelStyle}>{field.label} <span className="text-red-500">*</span></label>
                    <input 
                      type={field.type} 
                      name={field.key} 
                      value={metadata[field.key] || ""} 
                      onChange={handleInputChange} 
                      className={inputStyle} 
                      placeholder={field.placeholder}
                      disabled={isLoading}
                    />
                 </div>
              ))}

              {/* 2. Collection Date (Datepicker -> dd/MMM/yyyy) */}
              <div>
                 <label className={labelStyle}>Collection Date</label>
                 <div className="relative">
                    <input 
                        type="date" 
                        name="collection_date"
                        value={metadata.collection_date || ""} 
                        onChange={handleInputChange} 
                        className={`${inputStyle} cursor-pointer`} 
                        disabled={isLoading}
                    />
                    {!metadata.collection_date && (
                        <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    )}
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Format stored: 08/Dec/2005</p>
              </div>

              {/* 3. Province (Dropdown from Backend) */}
              <div>
                 <label className={labelStyle}>Province (adm1_name)</label>
                 <div className="relative">
                    <select 
                        name="province" 
                        value={metadata.province || ""} 
                        onChange={handleProvinceChange}
                        className={`${inputStyle} appearance-none cursor-pointer`}
                        disabled={isLoading}
                    >
                        <option value="">Select Province</option>
                        {provinceList.map((prov) => (
                            <option key={prov.adm1_pcode} value={prov.adm1_name}>
                                {prov.adm1_name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                         <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                 </div>
              </div>

              {/* 4. District (Dropdown from Backend via adm1_pcode) */}
              <div>
                 <label className={labelStyle}>District (adm2_name)</label>
                 <div className="relative">
                    <select 
                        name="district" 
                        value={metadata.district || ""} 
                        onChange={handleInputChange}
                        className={`${inputStyle} appearance-none cursor-pointer`}
                        disabled={isLoading || !selectedPcode || isLocationLoading}
                    >
                        <option value="">
                            {isLocationLoading ? "Loading..." : (!selectedPcode ? "Select Province First" : "Select District")}
                        </option>
                        {districtList.map((dist) => (
                            <option key={dist.adm2_pcode} value={dist.adm2_name}>
                                {dist.adm2_name}
                            </option>
                        ))}
                         <option value="NA">NA</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                         <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                 </div>
              </div>

              {/* 5. Loop Remaining Fields */}
              {GENERAL_FIELDS.slice(2).map((field) => (
                 <div key={field.key}>
                    <label className={labelStyle}>{field.label}</label>
                    {field.type === 'select' ? (
                        <div className="relative">
                            <select 
                                name={field.key} 
                                value={metadata[field.key] || ""} 
                                onChange={handleInputChange} 
                                className={`${inputStyle} appearance-none`}
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    ) : (
                        <input 
                            type={field.type} 
                            name={field.key} 
                            value={metadata[field.key] || ""} 
                            onChange={handleInputChange} 
                            className={inputStyle} 
                            placeholder={field.placeholder}
                            disabled={isLoading}
                        />
                    )}
                 </div>
              ))}

            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* File Upload Section */}
            <div className="bg-slate-50 p-6 rounded-lg border border-dashed border-slate-300">
              <label className="text-base font-semibold mb-4 block text-slate-800">
                Sequencing Files (.gz) <span className="text-red-500">*</span>
              </label>
              
              <div 
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`
                  bg-white border-2 border-dashed border-slate-300 rounded-lg p-10 
                  flex flex-col items-center justify-center cursor-pointer 
                  hover:border-slate-500 hover:bg-slate-50 transition-all duration-200
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Upload className="h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 font-medium">Click to select files</p>
                <input type="file" multiple accept=".gz" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isLoading} />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((f, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-white shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-orange-50 p-2 rounded text-orange-600"><FileArchive className="h-5 w-5" /></div>
                        <span className="truncate font-medium text-slate-700 text-sm">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} disabled={isLoading} className="text-slate-400 hover:text-red-600 p-2"><X className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
                <button type="submit" className={buttonStyle} disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</> : "Submit Data & Files"}
                </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}