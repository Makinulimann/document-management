<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Models\Menu;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request, $menuSlug)
    {
        $menu = Menu::where('menu_name', $menuSlug)->first();

        if (!$menu) {
            abort(404, 'Menu not found');
        }

        $documents = $this->buildDocumentQuery($menu->menu_id, $request);
        $breadcrumbsFolders = [];
        if ($request->folder_id) {
            $breadcrumbsFolders = $this->getFolderBreadcrumbs($request->folder_id);
        }

        $perPage = 10;
        $currentPage = $request->get('page', 1);
        $total = $documents->count();
        $offset = ($currentPage - 1) * $perPage;
        $items = $documents->slice($offset, $perPage)->values();

        $paginatedDocuments = [
            'data' => $items->toArray(),
            'current_page' => (int)$currentPage,
            'last_page' => (int)ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ];

        $user = Auth::user();
        $userData = [
            'user_id' => $user->user_id,
            'name' => $user->name,
            'role' => $user->role_name, // Make sure this is the role name
        ];

        return Inertia::render('SystemOwner/DocumentPage', [
            'title' => 'Data ' . strtoupper($menuSlug),
            'menuSlug' => $menuSlug,
            'documents' => $paginatedDocuments,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'folder_id' => $request->folder_id,
            ],
            'user' => $userData,
            'breadcrumbsFolders' => $breadcrumbsFolders,
        ]);
    }

    private function buildDocumentQuery($menuId, $request)
    {
        $folderId = $request->folder_id;
        $search = $request->search;
        $type = $request->type;

        $folders = Folder::where('menu_id', $menuId)
            ->where('parent_id', $folderId) // This will be null for root level
            ->with(['creator'])
            ->when($search, fn($query) => $query->where('folder_name', 'like', "%{$search}%"))
            ->get()
            ->map(fn($folder) => [
                'id' => $folder->folder_id,
                'name' => $folder->folder_name,
                'type' => 'folder',
                'size' => $this->calculateFolderSize($folder->folder_id),
                'date' => $folder->updated_at->format('d M Y'),
                'uploader' => null,
                'creator' => $folder->creator->name ?? 'Unknown',
                'file_type' => 'folder',
                'can_delete' => Auth::user()->role_name === 'admin' || Auth::user()->user_id === $folder->created_by,
            ]);

        $files = collect([]);

        if ($folderId) {
            // If we're inside a specific folder, get files directly in this folder
            $files = File::where('folder_id', $folderId)
                ->with(['uploader'])
                ->when($search, fn($query) => $query->where('file_name', 'like', "%{$search}%"))
                ->when($type && $type !== 'all' && $type !== 'folder', fn($query) => $query->where('file_type', $type))
                ->get()
                ->map(fn($file) => [
                    'id' => $file->file_id,
                    'name' => $file->file_name,
                    'type' => 'file',
                    'size' => $this->formatFileSize($file->file_size),
                    'date' => $file->updated_at->format('d M Y'), // Fix: Ensure date is formatted
                    'uploader' => $file->uploader->name ?? 'Unknown', // Fix: Ensure uploader name
                    'creator' => null,
                    'file_type' => $file->file_type,
                    'file_path' => $file->file_path,
                    'can_delete' => Auth::user()->role_name === 'admin' || Auth::user()->user_id === $file->uploaded_by,
                ]);
        } else {
            $rootFolderIds = Folder::where('menu_id', $menuId)
                ->whereNull('parent_id')
                ->pluck('folder_id')
                ->toArray();

            $allSubfolderIds = $this->getAllSubfolderIds($rootFolderIds);

            $files = File::where('menu_id', $menuId)
                ->whereNull('folder_id') // Exclude files in subfolders
                ->with(['uploader'])
                ->when($search, fn($query) => $query->where('file_name', 'like', "%{$search}%"))
                ->when($type && $type !== 'all' && $type !== 'folder', fn($query) => $query->where('file_type', $type))
                ->get()
                ->map(fn($file) => [
                    'id' => $file->file_id,
                    'name' => $file->file_name,
                    'type' => 'file',
                    'size' => $this->formatFileSize($file->file_size),
                    'date' => $file->updated_at->format('d M Y'), // Fix: Ensure date is formatted
                    'uploader' => $file->uploader->name ?? 'Unknown', // Fix: Ensure uploader name
                    'creator' => null,
                    'file_type' => $file->file_type,
                    'file_path' => $file->file_path,
                    'can_delete' => Auth::user()->role_name === 'admin' || Auth::user()->user_id === $file->uploaded_by,
                ]);
        }

        if ($type === 'folder') {
            $files = collect([]);
        }

        return $folders->concat($files)->sortBy('name');
    }

    // Helper method to get all subfolder IDs recursively
    private function getAllSubfolderIds($folderIds)
    {
        $allSubfolderIds = [];

        foreach ($folderIds as $folderId) {
            $subfolders = Folder::where('parent_id', $folderId)->pluck('folder_id')->toArray();
            if (!empty($subfolders)) {
                $allSubfolderIds = array_merge($allSubfolderIds, $subfolders);
                $deeperSubfolders = $this->getAllSubfolderIds($subfolders);
                $allSubfolderIds = array_merge($allSubfolderIds, $deeperSubfolders);
            }
        }

        return array_unique($allSubfolderIds);
    }

    public function store(Request $request, $menuSlug)
    {
        if (Auth::user()->role_name !== 'admin') {
            abort(403, 'Only admin can upload files');
        }
    
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,xls,xlsx,doc,docx,zip,rar,txt,csv,ppt,pptx',
            'folder_id' => 'nullable|exists:folders,folder_id',
        ]);        
    
        $menu = Menu::where('menu_name', $menuSlug)->firstOrFail();
        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();
        $fileType = $uploadedFile->getClientOriginalExtension();
        $filePath = $uploadedFile->store("documents/{$menuSlug}", 'public');
    
        $folderId = $request->folder_id ?? null;
    
        $file = File::create([
            'menu_id'   => $menu->menu_id,   // wajib
            'folder_id' => $request->folder_id ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'file_type' => $fileType,
            'uploaded_by' => Auth::id(),
        ]);        
    
        ActivityLog::create([
            'user_id' => Auth::id(),
            'file_id' => $file->file_id,
            'action' => 'upload',
            'timestamp' => now(),
        ]);
    
        return redirect()->back();
    }
    


    public function createFolder(Request $request, $menuSlug)
    {
        if (Auth::user()->role_name !== 'admin') {
            abort(403, 'Only admin can create folders');
        }

        $request->validate([
            'folder_name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,folder_id',
        ]);

        $menu = Menu::where('menu_name', $menuSlug)->firstOrFail();
        Folder::create([
            'menu_id' => $menu->menu_id,
            'parent_id' => $request->parent_id ?? null,
            'folder_name' => $request->folder_name,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back();
    }

    public function download($fileId)
    {
        $file = File::findOrFail($fileId);
        ActivityLog::create([
            'user_id' => Auth::id(),
            'file_id' => $file->file_id,
            'action' => 'download',
            'timestamp' => now(),
        ]);
        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }

    public function destroy($menuSlug, $id, $type)
    {
        try {
            if ($type === 'file') {
                $file = File::findOrFail($id);
                if (Auth::user()->role_name !== 'admin' && Auth::id() !== $file->uploaded_by) {
                    abort(403, 'Unauthorized');
                }
                Storage::disk('public')->delete($file->file_path);
                $file->delete();
            } else {
                $folder = Folder::findOrFail($id);
                if (Auth::user()->role_name !== 'admin' && Auth::id() !== $folder->created_by) {
                    abort(403, 'Unauthorized');
                }
                $this->deleteFolderRecursively($folder);
            }
            return redirect()->back();
        } catch (\Exception $e) {
            \Log::error('Failed to delete document: ' . $e->getMessage());
            return redirect()->back();
        }
    }

    public function update(Request $request, $menuSlug, $id, $type)
    {
        $request->validate(['name' => 'required|string|max:255']);

        if ($type === 'file') {
            $file = File::findOrFail($id);
            if (Auth::user()->role_name !== 'admin' && Auth::id() !== $file->uploaded_by) {
                abort(403, 'Unauthorized');
            }
            $file->update(['file_name' => $request->name]);
            $message = 'File renamed successfully';
        } else {
            $folder = Folder::findOrFail($id);
            if (Auth::user()->role_name !== 'admin' && Auth::id() !== $folder->created_by) {
                abort(403, 'Unauthorized');
            }
            $folder->update(['folder_name' => $request->name]);
            $message = 'Folder renamed successfully';
        }

        return redirect()->back();
    }

    private function calculateFolderSize($folderId)
    {
        $size = 0;
        $files = File::where('folder_id', $folderId)->get();
        foreach ($files as $file) {
            $size += $file->file_size;
        }
        $subfolders = Folder::where('parent_id', $folderId)->get();
        foreach ($subfolders as $subfolder) {
            $size += $this->calculateFolderSize($subfolder->folder_id);
        }
        return $this->formatFileSize($size);
    }

    private function deleteFolderRecursively($folder)
    {
        $files = $folder->files;
        foreach ($files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }
        $subfolders = $folder->children;
        foreach ($subfolders as $subfolder) {
            $this->deleteFolderRecursively($subfolder);
        }
        $folder->delete();
    }

    private function formatFileSize($size)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $unit = 0;
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        return round($size, 2) . ' ' . $units[$unit];
    }

    private function getFolderBreadcrumbs($folderId)
    {
        $breadcrumbs = [];
        while ($folderId) {
            $folder = Folder::find($folderId);
            if ($folder) {
                $breadcrumbs[] = [
                    'id' => $folder->folder_id,
                    'name' => $folder->folder_name,
                ];
                $folderId = $folder->parent_id;
            } else {
                break;
            }
        }
        return array_reverse($breadcrumbs); // biar urut dari root ke bawah
    }
}
