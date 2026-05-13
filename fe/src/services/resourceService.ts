import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ResourceItem {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  uploaderName: string;
  role: 'user' | 'admin';
  downloads: number;
  createdAt: string;
}

const getHeaders = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const getResources = async () => {
  const response = await axios.get(`${API_URL}/resources`);
  return response.data as ResourceItem[];
};

export const uploadResource = async (data: FormData) => {
  const response = await axios.post(`${API_URL}/resources/upload`, data, { 
    headers: {
      ...getHeaders(),
      'Content-Type': 'multipart/form-data'
    } 
  });
  return response.data;
};

export const checkEligibility = async () => {
  const response = await axios.get(`${API_URL}/resources/check-eligibility`, { headers: getHeaders() });
  return response.data as { canDownload: boolean, reason?: string, uploadedDocs?: number };
};
