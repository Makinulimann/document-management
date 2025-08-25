import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Eye, FileSpreadsheet, FileText, FolderIcon, FolderPlus, Pencil, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

type DocItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  date: string;
  uploader: string | null;
  creator: string | null;
  file_type: string;
  file_path?: string;
  can_delete: boolean;
};

type User = {
  user_id: string;
  name: string;
  role: string;
};

type PageProps = {
  title: string;
  menuSlug: string;
  documents: {
    data: DocItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  filters: {
    search: string;
    type: string;
    folder_id?: string;
  };
  user: User;
  flash?: {
    success?: string;
    error?: string;
  };
  breadcrumbsFolders: { id: string; name: string }[];
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white z-50 transition-opacity ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
};

const DROPZONE_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/vnd.rar': ['.rar'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

type DropzoneInputProps = {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
};

const DropzoneInput = ({ selectedFile, onFileSelect }: DropzoneInputProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: DROPZONE_ACCEPT,
    onDrop: (acceptedFiles) => {
      onFileSelect(acceptedFiles?.[0] ?? null);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <p className="text-sm text-gray-700">{selectedFile.name}</p>
      ) : (
        <p className="text-gray-500">Drag & drop a file here, or click to select</p>
      )}
    </div>
  );
};

const DocumentPage = () => {
  const { title, menuSlug, documents, filters, user, flash, breadcrumbsFolders } = usePage<PageProps>().props;

  const [search, setSearch] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isAdmin = user && user.role === 'admin';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Owner', href: '#' },
    { title, href: `/system-owner/${menuSlug}` },
    ...breadcrumbsFolders.map((f) => ({
      title: f.name,
      href: `/system-owner/${menuSlug}?folder_id=${f.id}`,
    })),
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search) params.set('search', search);
      else params.delete('search');
      if (selectedType !== 'all') params.set('type', selectedType);
      else params.delete('type');
      if (filters.folder_id) params.set('folder_id', filters.folder_id);
      else params.delete('folder_id');

      router.get(`/system-owner/${menuSlug}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true, replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedType, filters.folder_id, menuSlug]);

  useEffect(() => {
    if (flash?.success) showToast(flash.success);
    if (flash?.error) showToast(flash.error, 'error');
  }, [flash]);

  const handleFileUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (filters.folder_id) formData.append('folder_id', String(filters.folder_id));

    setUploading(true);
    router.post(`/system-owner/${menuSlug}/upload`, formData, {
      forceFormData: true, // penting untuk memastikan multipart/form-data
      onSuccess: () => {
        setShowUploadDialog(false);
        setSelectedFile(null);
        showToast('File uploaded successfully!');
      },
      onError: (errors) => showToast((errors as any)?.file || 'Upload failed', 'error'),
      onFinish: () => setUploading(false),
    });
  };

  const handleCreateFolder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    router.post(`/system-owner/${menuSlug}/create-folder`, formData, {
      onSuccess: () => {
        setShowFolderDialog(false);
        showToast('Folder created successfully!');
      },
      onError: (errors) => showToast((errors as any)?.folder_name || 'Failed to create folder', 'error'),
    });
  };

  const handleDownload = (document: DocItem) => {
    if (document.type === 'file') {
      window.open(`/system-owner/download/${document.id}`, '_blank');
    }
  };

  const handleDelete = (document: DocItem) => {
    if (!document.can_delete) return;
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      router.delete(`/system-owner/${menuSlug}/${document.id}/${document.type}`, {
        onSuccess: () => showToast(`${document.type} deleted successfully!`),
        onError: () => showToast('Delete failed', 'error'),
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      selectedItems.forEach((itemId) => {
        const document = documents.data.find((doc) => doc.id === itemId);
        if (document && document.can_delete) {
          router.delete(`/system-owner/${menuSlug}/${document.id}/${document.type}`);
        }
      });
      setSelectedItems([]);
    }
  };

  const handleRename = () => {
    if (!editingItem) return;
    router.patch(
      `/system-owner/${menuSlug}/${editingItem.id}/${editingItem.type}/update`,
      { name: editingItem.name },
      {
        onSuccess: () => {
          setEditingItem(null);
          showToast('Renamed successfully!');
        },
        onError: () => showToast('Rename failed', 'error'),
      }
    );
  };

  const fileIcon = (type: string, fileType: string) => {
    if (type === 'folder') return <FolderIcon className="h-5 w-5 text-blue-500" />;
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const toggleSelectAll = () => {
    if (documents.data.length === 0) return;
    if (selectedItems.length === documents.data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(documents.data.map((doc) => doc.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const navigateToFolder = (folderId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('folder_id', folderId);
    router.get(`/system-owner/${menuSlug}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kelola {title}</h2>
          {isAdmin && (
            <div className="flex gap-2">
              <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-4 flex items-center gap-2" variant="outline" size="sm">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateFolder} className="space-y-4">
                    <div>
                      <Label htmlFor="folder_name">Folder Name</Label>
                      <Input id="folder_name" name="folder_name" placeholder="Enter folder name..." required />
                      <input type="hidden" name="parent_id" value={filters.folder_id || ''} />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Folder
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-4 flex items-center gap-2 bg-sky-600 text-white hover:bg-sky-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFileUpload} className="space-y-4" encType="multipart/form-data">
                    <div>
                      <Label>Upload File</Label>
                      <DropzoneInput selectedFile={selectedFile} onFileSelect={setSelectedFile} />
                      {/* Tidak perlu <input type="file"> tersembunyi. File dikirim lewat FormData di handleFileUpload */}
                      {/* Sertakan folder_id jika ada */}
                      {/* <input type="hidden" name="folder_id" value={filters.folder_id || ''} />  -- tidak diperlukan karena kita append manual */}
                    </div>
                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF Files</SelectItem>
              <SelectItem value="xlsx">Excel Files</SelectItem>
              <SelectItem value="docx">Word Files</SelectItem>
              <SelectItem value="folder">Folders</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Search files and folders..."
            className="w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {selectedItems.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="ml-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={documents.data.length > 0 && selectedItems.length === documents.data.length}
                      onCheckedChange={() => toggleSelectAll()}
                    />
                  </th>
                  <th className="p-3 text-left">Name</th>
                  <th className="hidden p-3 text-left md:table-cell">Date</th>
                  <th className="hidden p-3 text-left lg:table-cell">Uploaded By</th>
                  <th className="hidden p-3 text-left lg:table-cell">Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.data.map((document) => (
                  <tr key={document.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedItems.includes(document.id)}
                        onCheckedChange={() => toggleSelectItem(document.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {fileIcon(document.type, document.file_type)}
                        {document.type === 'folder' ? (
                          <button
                            className="font-medium text-blue-600 hover:underline"
                            onClick={() => navigateToFolder(document.id)}
                          >
                            {document.name}
                          </button>
                        ) : editingItem?.id === document.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="h-8"
                              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            />
                            <Button size="sm" onClick={handleRename}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{document.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden p-3 text-sm text-gray-600 md:table-cell">{document.date}</td>
                    <td className="hidden p-3 text-sm text-gray-600 lg:table-cell">
                      {document.uploader || document.creator || '-'}
                    </td>
                    <td className="hidden p-3 text-sm text-gray-600 lg:table-cell">{document.size}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        {document.type === 'file' && (
                          <>
                            <Eye
                              className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800"
                              onClick={() => handleDownload(document)}
                            />
                            <Download
                              className="h-4 w-4 cursor-pointer text-green-600 hover:text-green-800"
                              onClick={() => handleDownload(document)}
                            />
                          </>
                        )}
                        {document.can_delete && (
                          <>
                            {document.type !== 'folder' && (
                              <Pencil
                                className="h-4 w-4 cursor-pointer text-yellow-500 hover:text-yellow-700"
                                onClick={() => setEditingItem({ id: document.id, name: document.name, type: document.type })}
                              />
                            )}
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(document)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No documents found. {isAdmin && "Click 'Upload File' or 'New Folder' to add."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {documents.data.length > 0 && documents.last_page > 1 && (
            <div className="flex items-center justify-between border-t bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Showing {documents.from || 1} to {documents.to || documents.data.length} of {documents.total} results
              </p>
              <div className="flex gap-1">
                {documents.current_page > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('page', (documents.current_page - 1).toString());
                      router.get(`/system-owner/${menuSlug}?${params.toString()}`);
                    }}
                  >
                    Previous
                  </Button>
                )}
                {Array.from({ length: Math.min(5, documents.last_page) }, (_, i) => {
                  let page;
                  if (documents.last_page <= 5) page = i + 1;
                  else if (documents.current_page <= 3) page = i + 1;
                  else if (documents.current_page >= documents.last_page - 2) page = documents.last_page - 4 + i;
                  else page = documents.current_page - 2 + i;
                  return (
                    <Button
                      key={page}
                      variant={page === documents.current_page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', page.toString());
                        router.get(`/system-owner/${menuSlug}?${params.toString()}`);
                      }}
                    >
                      {page}
                    </Button>
                  );
                })}
                {documents.current_page < documents.last_page && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('page', (documents.current_page + 1).toString());
                      router.get(`/system-owner/${menuSlug}?${params.toString()}`);
                    }}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default DocumentPage;
