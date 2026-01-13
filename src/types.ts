export interface NodeData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  content: React.ReactNode | null;
  iframeSrc: string | null;
  title: string;
  data?: any;
  // Enhanced state
  zIndex: number;
  minimized?: boolean;
  maximized?: boolean;
  locked?: boolean;
  selected?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  path: string;
  description?: string;
  icon?: string;
  lastOpened?: number;
  created?: number;
  isProtected?: boolean;
}