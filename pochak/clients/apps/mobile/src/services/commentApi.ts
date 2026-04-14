// Comment API service

import apiClient from '../api/client';

// ── Types ──────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userInitial: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  children: Comment[];
}

// ── APIs ───────────────────────────────────────────────────────────

export async function fetchComments(
  contentType: string,
  contentId: string,
): Promise<Comment[]> {
  const res = await apiClient.get(`/contents/${contentType}/${contentId}/comments`);
  const data = res.data.data ?? res.data;
  return Array.isArray(data) ? data : (data.content ?? []);
}

export async function postComment(
  contentType: string,
  contentId: string,
  body: string,
  parentId?: string,
): Promise<Comment> {
  const res = await apiClient.post(`/contents/${contentType}/${contentId}/comments`, {
    body,
    parentId,
  });
  return res.data.data ?? res.data;
}

export async function deleteComment(
  _contentType: string,
  _contentId: string,
  commentId: string,
): Promise<boolean> {
  await apiClient.delete(`/comments/${commentId}`);
  return true;
}
