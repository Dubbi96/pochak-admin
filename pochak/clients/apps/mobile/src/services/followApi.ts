// Follow API service with mock data fallback

const API_BASE = 'https://api.pochak.app';

// Local state for mock toggling
const mockFollowState: Record<string, boolean> = {};
const mockFollowerCounts: Record<string, number> = {
  'team:default': 1240,
  'club:default': 856,
};

function key(targetType: string, targetId: string) {
  return `${targetType}:${targetId}`;
}

export async function toggleFollow(
  targetType: string,
  targetId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/follow/${targetType}/${targetId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.following;
  } catch {
    // Mock toggle
    const k = key(targetType, targetId);
    const current = mockFollowState[k] ?? false;
    mockFollowState[k] = !current;
    const countKey = `${targetType}:${targetId}`;
    if (!mockFollowerCounts[countKey]) {
      mockFollowerCounts[countKey] =
        mockFollowerCounts[`${targetType}:default`] ?? 100;
    }
    mockFollowerCounts[countKey] += current ? -1 : 1;
    return !current;
  }
}

export async function getFollowerCount(
  targetType: string,
  targetId: string,
): Promise<number> {
  try {
    const res = await fetch(
      `${API_BASE}/follow/${targetType}/${targetId}/count`,
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.count;
  } catch {
    // Mock count
    const countKey = `${targetType}:${targetId}`;
    return (
      mockFollowerCounts[countKey] ??
      mockFollowerCounts[`${targetType}:default`] ??
      100
    );
  }
}

export async function isFollowing(
  targetType: string,
  targetId: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/follow/${targetType}/${targetId}/status`,
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.following;
  } catch {
    // Mock status
    return mockFollowState[key(targetType, targetId)] ?? false;
  }
}
