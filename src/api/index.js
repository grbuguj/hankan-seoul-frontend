const BASE_URL = import.meta.env.VITE_API_URL || null;

async function apiFetch(path, options = {}) {
  if (!BASE_URL) throw new Error('NO_API_URL');
  const headers = { ...options.headers };

  // Content-Type은 FormData가 아닐 때만 설정
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // HTTP 헤더 ISO-8859-1 제한 → 한글 비밀번호 인코딩
  if (headers['X-Admin-Password']) {
    headers['X-Admin-Password'] = encodeURIComponent(headers['X-Admin-Password']);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API ${res.status}`);
  }

  return res.json();
}

// ── Public ──

export async function fetchDongSquares() {
  if (!BASE_URL) return {};
  return apiFetch('/api/squares');
}

export async function submitDongSquare(data) {
  return apiFetch('/api/squares', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function uploadImage(file) {
  if (!BASE_URL) throw new Error('NO_API_URL');
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE_URL}/api/upload/image`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('이미지 업로드 실패');
  const data = await res.json();
  return data.imageUrl;
}

// ── Admin ──

export async function fetchAdminPending(password) {
  return apiFetch('/api/admin/pending', {
    headers: { 'X-Admin-Password': password },
  });
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
