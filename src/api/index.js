/**
 * API Service Layer
 *
 * 백엔드 팀 구현 명세:
 *
 * GET    /api/squares              → { [dongCode]: SquareData }
 * POST   /api/squares              → { success, squareId }
 *   body: { dongCode, name, ownerName, imageUrl, description, message, link, depositorName, isPremium }
 * POST   /api/upload/image         → { imageUrl }
 *   body: FormData (field: "image")
 *
 * Admin (헤더: X-Admin-Password):
 * GET    /api/admin/pending        → [SquareData]
 * PATCH  /api/admin/confirm/:id    → { success }
 * DELETE /api/admin/reject/:id     → { success }
 *
 * SquareData shape:
 * {
 *   id, dongCode, name, isPremium,
 *   ownerName, imageUrl, description,
 *   message, link, depositorName,
 *   status: 'pending'|'confirmed', createdAt
 * }
 */

import { MOCK_DONG_SQUARES } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || null;

async function apiFetch(path, options = {}) {
  if (!BASE_URL) throw new Error('NO_API');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchDongSquares() {
  try {
    return await apiFetch('/api/squares');
  } catch {
    return MOCK_DONG_SQUARES;
  }
}

export async function submitDongSquare(data) {
  try {
    return await apiFetch('/api/squares', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    return { success: true, mock: true };
  }
}

export async function uploadImage(file) {
  try {
    if (!BASE_URL) throw new Error('NO_API');
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE_URL}/api/upload/image`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('upload failed');
    const { imageUrl } = await res.json();
    return imageUrl;
  } catch {
    return URL.createObjectURL(file);
  }
}

export async function fetchAdminPending(password) {
  try {
    return await apiFetch('/api/admin/pending', {
      headers: { 'X-Admin-Password': password },
    });
  } catch {
    return [];
  }
}

export async function confirmSquare(id, password) {
  return apiFetch(`/api/admin/confirm/${id}`, {
    method: 'PATCH',
    headers: { 'X-Admin-Password': password },
  });
}

export async function rejectSquare(id, password) {
  return apiFetch(`/api/admin/reject/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': password },
  });
}
