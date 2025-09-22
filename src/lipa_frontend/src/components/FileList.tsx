import { useState } from 'react';
import { File, Image, FileText, Archive, Download, Eye, Trash2, Calendar, HardDrive } from 'lucide-react';
import { FileMetadata } from '../types/backend';

interface FileListProps {
  files: FileMetadata[];
  onFileDelete?: (filePath: string) => void;
  canDelete?: boolean;
  className?: string;
}

const FileList = ({ files, onFileDelete, canDelete = false, className = '' }: FileListProps) => {
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType === 'application/zip') return Archive;
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return FileText;
    return File;
  };

  const getFileTypeLabel = (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf': return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX';
      case 'application/zip': return 'ZIP';
      case 'image/png': return 'PNG';
      case 'image/jpeg':
      case 'image/jpg': return 'JPG';
      default: return 'FILE';
    }
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileView = (file: FileMetadata) => {
    // Create file URL for viewing/downloading
    const fileUrl = `/api/files/${file.path}`;
    
    if (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') {
      // Open in new tab for images and PDFs
      window.open(fileUrl, '_blank');
    } else {
      // Download for other file types
      handleFileDownload(file);
    }
  };

  const handleFileDownload = (file: FileMetadata) => {
    const fileUrl = `/api/files/${file.path}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDelete = (file: FileMetadata) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete?.(file.path);
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p>No files attached</p>
        <p className="text-sm text-gray-400">Upload files to attach them to this invoice</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Attached Files ({files.length})
        </h4>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => {
          const IconComponent = getFileIcon(file.mimeType);
          
          return (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-white rounded mr-3">
                <IconComponent className="h-5 w-5 text-gray-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                    {getFileTypeLabel(file.mimeType)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <HardDrive className="h-3 w-3 mr-1" />
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(file.uploadedAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => handleFileView(file)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? 'View file' : 'Download file'}
                >
                  {file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
                
                {file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? (
                  <button
                    onClick={() => handleFileDownload(file)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ) : null}
                
                {canDelete && onFileDelete && (
                  <button
                    onClick={() => handleFileDelete(file)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
              {selectedFile.mimeType.startsWith('image/') ? (
                <img 
                  src={`/api/files/${selectedFile.path}`}
                  alt={selectedFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedFile.mimeType === 'application/pdf' ? (
                <iframe
                  src={`/api/files/${selectedFile.path}`}
                  className="w-full h-96 border-0"
                  title={selectedFile.name}
                />
              ) : (
                <div className="text-center py-8">
                  <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <button
                    onClick={() => handleFileDownload(selectedFile)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
