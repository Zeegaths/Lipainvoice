import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Archive, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  invoiceId: bigint;
  onUploadComplete?: (filePath: string) => void;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileUpload = ({ invoiceId, onUploadComplete, className = '' }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Placeholder for useUploadInvoiceFile
  const uploadMutation = {
    mutateAsync: async ({ invoiceId, fileName, mimeType, chunk, complete }: {
      invoiceId: bigint;
      fileName: string;
      mimeType: string;
      chunk: Uint8Array;
      complete: boolean;
    }) => {
      console.log('Uploading file:', { invoiceId, fileName, mimeType, chunkSize: chunk.length, complete });
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return `uploaded_${fileName}`;
    }
  };

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  const maxFileSize = 25 * 1024 * 1024; // 25MB

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/zip') return Archive;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, DOCX, ZIP, PNG, or JPG files.';
    }
    if (file.size > maxFileSize) {
      return 'File size exceeds 25MB limit.';
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    
    // Add to uploading files
    setUploadingFiles(prev => new Map(prev.set(fileId, {
      file,
      progress: 0,
      status: 'uploading'
    })));

    try {
      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Update progress
      setUploadingFiles(prev => {
        const updated = new Map(prev);
        const current = updated.get(fileId);
        if (current) {
          updated.set(fileId, { ...current, progress: 50 });
        }
        return updated;
      });

      // Upload file
      const result = await uploadMutation.mutateAsync({
        invoiceId,
        fileName: file.name,
        mimeType: file.type,
        chunk: uint8Array,
        complete: true
      });

      // Update to completed
      setUploadingFiles(prev => {
        const updated = new Map(prev);
        const current = updated.get(fileId);
        if (current) {
          updated.set(fileId, { ...current, progress: 100, status: 'completed' });
        }
        return updated;
      });

      if (result && onUploadComplete) {
        const filePath = Array.isArray(result) ? result[0] : result;
        onUploadComplete(typeof filePath === 'string' ? filePath : String(filePath || ''));
      }

      // Remove from uploading files after a delay
      setTimeout(() => {
        setUploadingFiles(prev => {
          const updated = new Map(prev);
          updated.delete(fileId);
          return updated;
        });
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => {
        const updated = new Map(prev);
        const current = updated.get(fileId);
        if (current) {
          updated.set(fileId, { 
            ...current, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          });
        }
        return updated;
      });
    }
  }, [invoiceId, uploadMutation, onUploadComplete]);

  const handleFiles = useCallback(async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      await uploadFile(file);
    }
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Support for PDF, DOCX, ZIP, PNG, JPG files up to 25MB
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
          <span className="px-2 py-1 bg-gray-100 rounded">DOCX</span>
          <span className="px-2 py-1 bg-gray-100 rounded">ZIP</span>
          <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
          <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.zip,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploading Files</h4>
          {Array.from(uploadingFiles.entries()).map(([fileId, uploadingFile]) => {
            const IconComponent = getFileIcon(uploadingFile.file.type);
            
            return (
              <div key={fileId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded mr-3">
                  <IconComponent className="h-4 w-4 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {uploadingFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
                
                <div className="ml-3">
                  {uploadingFile.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  )}
                  {uploadingFile.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <button
                    onClick={() => removeUploadingFile(fileId)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
