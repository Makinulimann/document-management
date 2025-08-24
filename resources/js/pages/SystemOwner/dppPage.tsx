import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Eye, Download, Pencil, Trash2, FileText, FileSpreadsheet } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'System Owner', href: '#' },
  { title: 'DPP', href: '/system-owner/dpp' },
]

const DppPage = () => {
  const [search, setSearch] = useState("");

  const files = [
    {
      name: "Reliability_Report_Q1_2024.pdf",
      date: "15 Jan 2024",
      uploader: "Ahmad Rizki",
      type: "pdf",
    },
    {
      name: "Asset_Database_Update.xlsx",
      date: "12 Jan 2024",
      uploader: "Sari Wijaya",
      type: "excel",
    },
    {
      name: "CBM_Analysis_Report.docx",
      date: "10 Jan 2024",
      uploader: "Budi Santoso",
      type: "word",
    },
  ];

  const fileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "excel":
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case "word":
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data DPP" />

      <h2 className="text-lg font-semibold mb-2">
        Kelola dan pantau data engineering berbasis pusat data
      </h2>

      {/* 🔹 Filter Section */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All PLTA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PLTA</SelectItem>
            <SelectItem value="plta1">PLTA 1</SelectItem>
            <SelectItem value="plta2">PLTA 2</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="laporan">Laporan</SelectItem>
            <SelectItem value="database">Database</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Cari berdasarkan nama file..."
          className="w-[250px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button className="ml-auto bg-sky-600 hover:bg-sky-700 text-white">
          + Tambah File
        </Button>
      </div>

      {/* 🔹 List Files */}
      <Card className="p-4 space-y-3">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
          >
            {/* Nama & Icon */}
            <div className="flex items-center gap-2">
              {fileIcon(file.type)}
              <span className="font-medium">{file.name}</span>
            </div>

            {/* Info Upload */}
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
              <span>{file.date}</span>
              <span>{file.uploader}</span>
            </div>

            {/* Aksi */}
            <div className="flex gap-2">
              <Eye className="w-5 h-5 text-sky-600 cursor-pointer" />
              <Download className="w-5 h-5 text-green-600 cursor-pointer" />
              <Pencil className="w-5 h-5 text-yellow-500 cursor-pointer" />
              <Trash2 className="w-5 h-5 text-red-600 cursor-pointer" />
            </div>
          </div>
        ))}

        {/* 🔹 Pagination */}
        <div className="flex justify-between items-center pt-3 text-sm text-gray-500">
          <p>Menampilkan 1-3 dari 25 file</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default DppPage;
