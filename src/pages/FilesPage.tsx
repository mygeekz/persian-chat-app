import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext, FileItem } from '@/context/AppContext';
import { filesApi } from '@/utils/api';
import { strings } from '@/utils/strings';
import { FilesSkeleton } from '@/components/common/SkeletonLoader';
import { LoadingButton } from '@/components/common/LoadingButton';
import { PersianInput } from '@/components/ui/PersianInput';
import { PersianButton } from '@/components/ui/PersianButton';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface FileCardProps {
  file: FileItem;
  onDelete: (fileId: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const isImage = file.type.startsWith('image/');
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* File Preview */}
      <div className="aspect-square mb-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <DocumentIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-foreground font-vazir text-sm truncate" title={file.name}>
          {file.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="numbers-ltr">
            {formatFileSize(file.size)}
          </span>
          <span className="numbers-ltr">
            {new Date(file.uploadedAt).toLocaleDateString('fa-IR')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1 space-x-reverse">
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="مشاهده"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => onDelete(file.id)}
            className="p-1 text-muted-foreground hover:text-destructive"
            title="حذف"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FilesPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const result = await filesApi.getFiles();
      if (result.success && result.data) {
        setFiles(result.data);
        dispatch({ type: 'SET_FILES', payload: result.data });
      }
    } catch (error) {
      toast.error('خطا در بارگیری فایل‌ها');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await filesApi.uploadFile(file);
      
      if (result.success && result.data) {
        setFiles(prev => [...prev, result.data]);
        dispatch({ type: 'ADD_FILE', payload: result.data });
        toast.success(strings.fileUploaded);
        setUploadProgress(100);
      } else {
        toast.error(result.error || 'خطا در بارگذاری فایل');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    try {
      const result = await filesApi.deleteFile(fileId);
      
      if (result.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        dispatch({ type: 'DELETE_FILE', payload: fileId });
        toast.success(strings.fileDeleted);
      } else {
        toast.error(result.error || 'خطا در حذف فایل');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`فایل ${file.name} بیش از ۱۰ مگابایت است`);
        return;
      }
      uploadFile(file);
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground font-vazir mb-6">
          {strings.files}
        </h1>
        <FilesSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-vazir">
            {strings.files}
          </h1>
          <p className="text-sm text-muted-foreground font-vazir">
            مدیریت فایل‌های آپلود شده
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground font-vazir numbers-ltr">
          {filteredFiles.length} فایل
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-border hover:border-primary hover:bg-primary/5'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <CloudArrowUpIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-foreground font-vazir">
                در حال بارگذاری...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground numbers-ltr">
                {uploadProgress}%
              </p>
            </div>
          ) : isDragActive ? (
            <p className="text-primary font-vazir">
              فایل‌ها را اینجا رها کنید...
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-foreground font-vazir">
                {strings.dragDropFile}
              </p>
              <p className="text-sm text-muted-foreground font-vazir">
                حداکثر حجم: ۱۰ مگابایت
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {files.length > 0 && (
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <PersianInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در فایل‌ها..."
            className="pr-10"
          />
        </div>
      )}

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-vazir">
            {searchQuery ? 'فایلی یافت نشد' : 'هنوز فایلی بارگذاری نشده است'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};