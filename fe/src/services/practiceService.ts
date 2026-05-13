import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PracticeItem {
  _id: string;
  type: 'grammar' | 'vocab' | 'kanji' | 'alphabet';
  title: string;
  level?: string;
  meaning: {
    jp?: string;
    en?: string;
    vn: string;
  };
  reading?: string;
  hanviet?: string;
  structure?: string;
  examples?: {
    jp: string;
    en?: string;
    vn: string;
  }[];
  category?: string;
}

export const getPractices = async (params: { 
  type?: string; 
  level?: string; 
  limit?: number; 
  random?: boolean 
}) => {
  const response = await axios.get(`${API_URL}/practices`, { params });
  return response.data as PracticeItem[];
};

export const getPracticeStats = async () => {
  const response = await axios.get(`${API_URL}/practices/stats`);
  return response.data;
};
