export interface Chapter {
  id: string;
  label: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  type: 'HALF' | 'BREAK' | 'HIGHLIGHT' | 'CUSTOM';
}

export function getChapters(
  _contentType: string,
  _contentId: string,
): Promise<Chapter[]> {
  // Mock: generate match structure chapters
  return Promise.resolve([
    {
      id: 'ch1',
      label: '전반전',
      startTimeSeconds: 0,
      endTimeSeconds: 2700,
      type: 'HALF',
    },
    {
      id: 'ch2',
      label: '하프타임',
      startTimeSeconds: 2700,
      endTimeSeconds: 3600,
      type: 'BREAK',
    },
    {
      id: 'ch3',
      label: '후반전',
      startTimeSeconds: 3600,
      endTimeSeconds: 6300,
      type: 'HALF',
    },
    {
      id: 'ch4',
      label: '추가시간',
      startTimeSeconds: 6300,
      endTimeSeconds: 6600,
      type: 'HALF',
    },
  ]);
}
