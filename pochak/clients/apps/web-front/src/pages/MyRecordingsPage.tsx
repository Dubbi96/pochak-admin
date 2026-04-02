import { useState, useMemo, useCallback } from 'react';
import {
  LuCalendarDays, LuList, LuPlus, LuClock,
  LuMapPin, LuChevronLeft, LuChevronRight,
  LuPencil, LuTrash2, LuVideo, LuX,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import FilterChip from '@/components/FilterChip';
import Modal from '@/components/Modal';
import { useMyRecordings, createRecordingSchedule, updateRecordingSchedule, deleteRecordingSchedule } from '@/hooks/useApi';
import type { RecordingSchedule, RecordingStatus } from '@/types/content';

/* ── Mock data ── */
const mockRecordings: RecordingSchedule[] = [
  { id: 'rec1', title: '동대문 리틀야구 리그전', venueId: 'v1', venueName: '잠실 유소년 야구장', date: '2026-04-10', startTime: '10:00', endTime: '12:00', memo: '3루측 카메라 설치', status: 'SCHEDULED', reservationId: 'r1', createdAt: '2026-04-03T08:00:00Z' },
  { id: 'rec2', title: '서초FC 연습 경기', venueId: 'v2', venueName: '화성 드림파크 풋살 센터', date: '2026-04-15', startTime: '14:00', endTime: '16:00', status: 'SCHEDULED', createdAt: '2026-04-02T15:00:00Z' },
  { id: 'rec3', title: '강남 유소년 야구 대회', venueId: 'v1', venueName: '잠실 유소년 야구장', date: '2026-04-05', startTime: '09:00', endTime: '11:00', memo: '1경기 촬영', status: 'SCHEDULED', createdAt: '2026-04-01T10:00:00Z' },
  { id: 'rec4', title: '화성 풋살 리그 3R', venueId: 'v2', venueName: '화성 드림파크 풋살 센터', date: '2026-03-28', startTime: '19:00', endTime: '21:00', status: 'COMPLETED', createdAt: '2026-03-25T09:00:00Z' },
];

const mockVenueOptions = [
  { id: 'v1', name: '잠실 유소년 야구장' },
  { id: 'v2', name: '화성 드림파크 풋살 센터' },
];

const STATUS_LABELS: Record<RecordingStatus, string> = {
  SCHEDULED: '예정',
  IN_PROGRESS: '촬영중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const STATUS_COLORS: Record<RecordingStatus, string> = {
  SCHEDULED: 'bg-primary/15 text-primary',
  IN_PROGRESS: 'bg-pochak-live/15 text-pochak-live',
  COMPLETED: 'bg-white/[0.06] text-white/50',
  CANCELLED: 'bg-white/[0.06] text-white/30',
};

type ViewMode = 'calendar' | 'list';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatPrice(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface NewScheduleForm {
  title: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  memo: string;
}

const emptyForm: NewScheduleForm = { title: '', venueId: '', date: '', startTime: '', endTime: '', memo: '' };

export default function MyRecordingsPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewScheduleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: apiRecordings } = useMyRecordings(year, month);
  const recordings = apiRecordings.length > 0 ? apiRecordings : mockRecordings;

  /* ── Calendar grid computation ── */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [year, month]);

  const recordingsByDate = useMemo(() => {
    const map: Record<string, RecordingSchedule[]> = {};
    for (const rec of recordings) {
      if (!map[rec.date]) map[rec.date] = [];
      map[rec.date].push(rec);
    }
    return map;
  }, [recordings]);

  const upcomingRecordings = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return recordings
      .filter(r => r.date >= todayStr && r.status !== 'CANCELLED')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [recordings]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleSubmit = useCallback(async () => {
    if (!formData.title || !formData.venueId || !formData.date || !formData.startTime || !formData.endTime) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateRecordingSchedule(editingId, formData);
      } else {
        await createRecordingSchedule({ ...formData, memo: formData.memo || undefined });
      }
    } catch {
      // API not available yet — proceed with mock success
    }
    setSubmitting(false);
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  }, [formData, editingId]);

  const handleEdit = (rec: RecordingSchedule) => {
    setFormData({
      title: rec.title,
      venueId: rec.venueId,
      date: rec.date,
      startTime: rec.startTime,
      endTime: rec.endTime,
      memo: rec.memo || '',
    });
    setEditingId(rec.id);
    setShowForm(true);
  };

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteRecordingSchedule(id); } catch { /* mock */ }
    setDeleteConfirm(null);
  }, []);

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isToday = (day: number) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-[-0.04em] text-white">내 촬영일정</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border-subtle overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar' ? 'bg-primary/15 text-primary' : 'text-white/50 hover:text-white'
              }`}
            >
              <LuCalendarDays className="h-3.5 w-3.5" />
              캘린더
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-white/50 hover:text-white'
              }`}
            >
              <LuList className="h-3.5 w-3.5" />
              리스트
            </button>
          </div>
          <Button variant="cta" size="sm" className="gap-1.5" onClick={() => { setFormData(emptyForm); setEditingId(null); setShowForm(true); }}>
            <LuPlus className="h-3.5 w-3.5" />
            새 일정
          </Button>
        </div>
      </div>

      {/* ── Calendar view ── */}
      {viewMode === 'calendar' && (
        <div className="flex flex-col gap-4">
          {/* Month navigation */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={prevMonth} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
              <LuChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-[18px] font-bold text-white w-32 text-center">
              {formatPrice(new Date(year, month))}
            </span>
            <button onClick={nextMonth} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
              <LuChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAYS_KO.map((d, i) => (
              <div key={d} className={`text-center text-[12px] font-medium py-2 ${
                i === 0 ? 'text-pochak-live' : i === 6 ? 'text-blue-400' : 'text-white/40'
              }`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-t border-border-subtle">
            {calendarDays.map((day, idx) => {
              const recs = day ? recordingsByDate[dateKey(day)] || [] : [];
              const dayOfWeek = idx % 7;
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] border-b border-r border-border-subtle p-1.5 ${
                    !day ? 'bg-transparent' : ''
                  } ${dayOfWeek === 6 ? 'border-r-0' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[12px] font-medium ${
                        isToday(day)
                          ? 'bg-primary text-white font-bold'
                          : dayOfWeek === 0 ? 'text-pochak-live'
                          : dayOfWeek === 6 ? 'text-blue-400'
                          : 'text-white/60'
                      }`}>
                        {day}
                      </span>
                      <div className="flex flex-col gap-0.5" style={{ marginTop: 2 }}>
                        {recs.slice(0, 2).map(rec => (
                          <button
                            key={rec.id}
                            onClick={() => handleEdit(rec)}
                            className={`w-full text-left px-1 py-0.5 rounded text-[10px] font-medium truncate transition-colors ${
                              rec.status === 'COMPLETED'
                                ? 'bg-white/[0.04] text-white/40'
                                : 'bg-primary/15 text-primary hover:bg-primary/25'
                            }`}
                          >
                            {rec.startTime} {rec.title}
                          </button>
                        ))}
                        {recs.length > 2 && (
                          <span className="text-[10px] text-white/30 px-1">+{recs.length - 2}건</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── List view ── */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[17px] font-bold text-white">다가오는 촬영 일정</h2>

          {upcomingRecordings.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <LuVideo className="h-12 w-12 text-white/15" />
              <p className="text-[15px] text-white/40">예정된 촬영 일정이 없습니다</p>
              <Button variant="cta" onClick={() => { setFormData(emptyForm); setEditingId(null); setShowForm(true); }}>
                새 일정 만들기
              </Button>
            </div>
          ) : (
            upcomingRecordings.map(rec => (
              <div
                key={rec.id}
                className="rounded-xl border border-border-subtle bg-pochak-surface p-5 hover:border-white/[0.15] transition-all"
              >
                <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <LuVideo className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{rec.title}</p>
                      <p className="text-[13px] text-white/45">{rec.venueName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${STATUS_COLORS[rec.status]}`}>
                      {STATUS_LABELS[rec.status]}
                    </span>
                    <button
                      onClick={() => handleEdit(rec)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <LuPencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(rec.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-pochak-live hover:bg-pochak-live/10 transition-colors"
                    >
                      <LuTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[13px] text-white/55">
                  <span className="flex items-center gap-1.5">
                    <LuCalendarDays className="h-3.5 w-3.5" />
                    {formatDateLabel(rec.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuClock className="h-3.5 w-3.5" />
                    {rec.startTime} ~ {rec.endTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuMapPin className="h-3.5 w-3.5" />
                    {rec.venueName}
                  </span>
                </div>

                {rec.memo && (
                  <p className="text-[13px] text-white/35 italic" style={{ marginTop: 8 }}>
                    {rec.memo}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── New / Edit Schedule Modal ── */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? '일정 수정' : '새 촬영 일정'}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="촬영 일정 제목"
              className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>장소 선택</label>
            <select
              value={formData.venueId}
              onChange={e => setFormData(f => ({ ...f, venueId: e.target.value }))}
              className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white focus:border-primary/50 focus:outline-none transition-colors appearance-none"
            >
              <option value="" className="bg-[#1a1a1a]">장소를 선택하세요</option>
              {mockVenueOptions.map(v => (
                <option key={v.id} value={v.id} className="bg-[#1a1a1a]">{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>날짜</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>시작 시간</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))}
                className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>종료 시간</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData(f => ({ ...f, endTime: e.target.value }))}
                className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] text-white/50 block" style={{ marginBottom: 6 }}>메모 (선택)</label>
            <textarea
              value={formData.memo}
              onChange={e => setFormData(f => ({ ...f, memo: e.target.value }))}
              placeholder="촬영 관련 메모"
              rows={3}
              className="w-full rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:border-primary/50 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setEditingId(null); }}>
              취소
            </Button>
            <Button
              variant="cta"
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting || !formData.title || !formData.venueId || !formData.date || !formData.startTime || !formData.endTime}
            >
              {submitting ? '처리 중...' : editingId ? '수정하기' : '생성하기'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="일정 삭제">
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-white/70">이 촬영 일정을 삭제하시겠습니까?</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              취소
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}
