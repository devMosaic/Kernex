import { 
  File, FileCode, FileJson, FileType, FileText, Image, Music, Video, Folder, FolderOpen, Box
} from 'lucide-react';

export const getFileIcon = (name: string, isFolder: boolean, isOpen: boolean) => {
  if (isFolder) {
    return isOpen ? <FolderOpen size={16} color="#E0E0E0" /> : <Folder size={16} color="#90a4ae" />;
  }

  const ext = name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode size={16} color="#3178c6" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileType size={16} color="#563d7c" />;
    case 'html':
      return <FileCode size={16} color="#e34c26" />;
    case 'json':
      return <FileJson size={16} color="#fbc02d" />;
    case 'md':
    case 'txt':
    case 'log':
      return <FileText size={16} color="#9e9e9e" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <Image size={16} color="#b388ff" />;
    case 'mp3':
    case 'wav':
      return <Music size={16} color="#ff4081" />;
    case 'mp4':
    case 'webm':
      return <Video size={16} color="#ff5252" />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <Box size={16} color="#ff9800" />;
    default:
      return <File size={16} color="#90a4ae" />;
  }
};
