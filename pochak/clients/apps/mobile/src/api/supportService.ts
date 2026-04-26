/**
 * Support (FAQ & 1:1 Inquiry) API service.
 * Calls real App BFF via gateway.
 */

import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────

export type FaqCategory = '전체' | '계정' | '결제' | '영상' | '이용권' | '기타';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export interface InquiryItem {
  id: string;
  category: string;
  title: string;
  date: string;
  status: '답변완료' | '답변대기';
  answer?: string;
}

export interface InquiryCreateRequest {
  category: string;
  title: string;
  content: string;
}

// ── Interface ──────────────────────────────────────────────────────

export interface ISupportService {
  getFaqs(category?: string): Promise<FaqItem[]>;
  getMyInquiries(): Promise<InquiryItem[]>;
  createInquiry(data: InquiryCreateRequest): Promise<void>;
}

// ── Implementation ─────────────────────────────────────────────────

class SupportService implements ISupportService {
  async getFaqs(category?: string): Promise<FaqItem[]> {
    const params: Record<string, string> = {};
    if (category && category !== '전체') params.category = category;
    const res = await apiClient.get('/faqs', { params });
    return res.data?.content ?? res.data ?? [];
  }

  async getMyInquiries(): Promise<InquiryItem[]> {
    const res = await apiClient.get('/cs/inquiries/my');
    return res.data?.content ?? res.data ?? [];
  }

  async createInquiry(data: InquiryCreateRequest): Promise<void> {
    await apiClient.post('/cs/inquiries', data);
  }
}

export const supportService = new SupportService();
