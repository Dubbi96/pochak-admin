import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {
  CameraStatus,
  Reservation,
  ReservationStatus,
  TimeSlot,
  Venue,
  formatCurrency,
  getCameraStatusLabel,
  getMockTimeSlots,
  getReservationStatusLabel,
  mockReservations,
  mockVenues,
} from '../../services/reservationApi';

// ─── Constants ──────────────────────────────────────────

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const dayName = DAYS_KR[date.getDay()];
  return `${Number(m)}월 ${Number(d)}일 (${dayName})`;
}

// ─── Camera Status Color ────────────────────────────────

function cameraStatusColor(status: CameraStatus): string {
  switch (status) {
    case 'ONLINE':
      return colors.green;
    case 'OFFLINE':
      return colors.error;
    case 'MAINTENANCE':
      return '#FFC107';
  }
}

// ─── Reservation Status Badge Color ─────────────────────

function reservationStatusColor(status: ReservationStatus): string {
  switch (status) {
    case 'PENDING':
      return '#FFC107';
    case 'CONFIRMED':
      return colors.green;
    case 'COMPLETED':
      return colors.gray;
    case 'CANCELLED':
      return colors.error;
  }
}

// ─── Step Indicator ─────────────────────────────────────

function StepIndicator({step, label}: {step: number; label: string}) {
  return (
    <View style={styles.stepIndicator}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}

// ─── Venue Card ─────────────────────────────────────────

function VenueCard({
  venue,
  isSelected,
  onPress,
}: {
  venue: Venue;
  isSelected: boolean;
  onPress: () => void;
}) {
  const statusColor = cameraStatusColor(venue.cameraStatus);
  return (
    <TouchableOpacity
      style={[styles.venueCard, isSelected && styles.venueCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.venueCardTop}>
        <Text style={styles.venueName} numberOfLines={1}>
          {venue.name}
        </Text>
        <View style={[styles.cameraBadge, {backgroundColor: statusColor + '22'}]}>
          <View style={[styles.cameraDot, {backgroundColor: statusColor}]} />
          <Text style={[styles.cameraStatusText, {color: statusColor}]}>
            {getCameraStatusLabel(venue.cameraStatus)}
          </Text>
        </View>
      </View>
      <Text style={styles.venueAddress} numberOfLines={1}>
        {venue.address}
      </Text>
      <View style={styles.venueBottom}>
        <View style={styles.venueTag}>
          <MaterialIcons name="sports" size={14} color={colors.grayLight} />
          <Text style={styles.venueTagText}>{venue.sport}</Text>
        </View>
        <Text style={styles.venueCameraCount}>
          카메라 {venue.cameraCount}대
        </Text>
        <Text style={styles.venuePrice}>
          {formatCurrency(venue.pricePerHour)}/시간
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Calendar ───────────────────────────────────────────

function Calendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayStr = formatDateStr(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const calendarDays = useMemo(() => {
    const days: Array<{day: number; dateStr: string} | null> = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({day: d, dateStr: formatDateStr(calYear, calMonth, d)});
    }
    return days;
  }, [calYear, calMonth, daysInMonth, firstDay]);

  const prevMonth = () => {
    if (calMonth === 1) {
      setCalYear(calYear - 1);
      setCalMonth(12);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 12) {
      setCalYear(calYear + 1);
      setCalMonth(1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={prevMonth} activeOpacity={0.7}>
          <MaterialIcons name="chevron-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.calTitle}>
          {calYear}년 {calMonth}월
        </Text>
        <TouchableOpacity onPress={nextMonth} activeOpacity={0.7}>
          <MaterialIcons name="chevron-right" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.calWeekRow}>
        {DAYS_KR.map(d => (
          <Text
            key={d}
            style={[
              styles.calWeekDay,
              d === '일' && {color: colors.error},
              d === '토' && {color: '#4488FF'},
            ]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.calGrid}>
        {calendarDays.map((item, idx) => {
          if (!item) {
            return <View key={`empty-${idx}`} style={styles.calCell} />;
          }
          const isPast = item.dateStr < todayStr;
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.calCell,
                isSelected && styles.calCellSelected,
                isToday && !isSelected && styles.calCellToday,
              ]}
              disabled={isPast}
              onPress={() => onSelectDate(item.dateStr)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.calDayText,
                  isPast && styles.calDayPast,
                  isSelected && styles.calDaySelected,
                ]}>
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Time Slot Grid ─────────────────────────────────────

function TimeSlotGrid({
  slots,
  selectedSlotId,
  onSelectSlot,
}: {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
}) {
  return (
    <View style={styles.timeGrid}>
      {slots.map(slot => {
        const isSelected = slot.id === selectedSlotId;
        const isUnavailable = slot.status === 'UNAVAILABLE';
        return (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              isUnavailable && styles.timeSlotUnavailable,
              !isUnavailable && !isSelected && styles.timeSlotAvailable,
              isSelected && styles.timeSlotSelected,
            ]}
            disabled={isUnavailable}
            onPress={() => onSelectSlot(slot)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.timeSlotText,
                isUnavailable && styles.timeSlotTextUnavailable,
                isSelected && styles.timeSlotTextSelected,
              ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Reservation Card ───────────────────────────────────

function ReservationCard({reservation}: {reservation: Reservation}) {
  const badgeColor = reservationStatusColor(reservation.status);
  return (
    <View style={styles.reservationCard}>
      <View style={styles.reservationTop}>
        <Text style={styles.reservationVenue} numberOfLines={1}>
          {reservation.venueName}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: badgeColor + '22'}]}>
          <Text style={[styles.statusBadgeText, {color: badgeColor}]}>
            {getReservationStatusLabel(reservation.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.reservationDetail}>
        {formatDateDisplay(reservation.date)} {reservation.time}
      </Text>
      <Text style={styles.reservationCost}>
        {formatCurrency(reservation.cost)}
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────

export default function FilmingScreen() {
  // Step 1: Venue
  const [searchText, setSearchText] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Step 2: Date/Time
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots] = useState<TimeSlot[]>(getMockTimeSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // My reservations toggle
  const [showMyReservations, setShowMyReservations] = useState(false);

  const filteredVenues = useMemo(() => {
    if (!searchText.trim()) return mockVenues;
    const q = searchText.trim().toLowerCase();
    return mockVenues.filter(
      v =>
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.sport.toLowerCase().includes(q),
    );
  }, [searchText]);

  const selectedTimeSlot = useMemo(
    () => timeSlots.find(s => s.id === selectedSlotId) ?? null,
    [timeSlots, selectedSlotId],
  );

  const canConfirm = selectedVenue && selectedDate && selectedTimeSlot;

  const handleSelectSlot = useCallback((slot: TimeSlot) => {
    setSelectedSlotId(slot.id);
  }, []);

  const handleReserve = useCallback(() => {
    if (!selectedVenue || !selectedDate || !selectedTimeSlot) return;
    Alert.alert(
      '예약 확인',
      `${selectedVenue.name}\n${formatDateDisplay(selectedDate)} ${selectedTimeSlot.time}\n${formatCurrency(selectedVenue.pricePerHour)}`,
      [
        { text: '취소' },
        { text: '예약하기', onPress: () => {
          Alert.alert('예약 완료', '촬영 예약이 완료되었습니다.', [
            { text: '확인', onPress: () => setShowMyReservations(true) }
          ]);
        }},
      ]
    );
  }, [selectedVenue, selectedDate, selectedTimeSlot]);

  const renderReservation = useCallback(
    ({item}: {item: Reservation}) => <ReservationCard reservation={item} />,
    [],
  );

  if (showMyReservations) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>내 예약 목록</Text>
            <TouchableOpacity
              onPress={() => setShowMyReservations(false)}
              activeOpacity={0.7}>
              <Text style={styles.toggleText}>예약하기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockReservations}
            renderItem={renderReservation}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="event-busy" size={48} color={colors.gray} />
                <Text style={styles.emptyText}>예약 내역이 없습니다</Text>
              </View>
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>촬영예약</Text>
          <TouchableOpacity
            onPress={() => setShowMyReservations(true)}
            activeOpacity={0.7}>
            <Text style={styles.toggleText}>내 예약</Text>
          </TouchableOpacity>
        </View>

        {/* Step 1: Venue Selection */}
        <StepIndicator step={1} label="구장 선택" />
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="구장명, 주소, 종목 검색"
            placeholderTextColor={colors.gray}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              activeOpacity={0.7}>
              <MaterialIcons name="close" size={18} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
        {filteredVenues.map(venue => (
          <VenueCard
            key={venue.id}
            venue={venue}
            isSelected={selectedVenue?.id === venue.id}
            onPress={() => setSelectedVenue(venue)}
          />
        ))}

        {/* Step 2: Date/Time */}
        {selectedVenue && (
          <>
            <View style={styles.sectionSpacer} />
            <StepIndicator step={2} label="날짜/시간 선택" />
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate && (
              <>
                <Text style={styles.subSectionTitle}>
                  시간 선택 - {formatDateDisplay(selectedDate)}
                </Text>
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={handleSelectSlot}
                />
              </>
            )}
          </>
        )}

        {/* Step 3: Confirmation */}
        {canConfirm && (
          <>
            <View style={styles.sectionSpacer} />
            <StepIndicator step={3} label="예약 확인" />
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>구장</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {selectedVenue.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>날짜</Text>
                <Text style={styles.summaryValue}>
                  {formatDateDisplay(selectedDate)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>시간</Text>
                <Text style={styles.summaryValue}>
                  {selectedTimeSlot.time}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>촬영 비용</Text>
                <Text style={styles.summaryCost}>
                  {formatCurrency(selectedVenue.pricePerHour)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={handleReserve}
              activeOpacity={0.8}>
              <Text style={styles.reserveButtonText}>예약하기</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 32,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
    padding: 0,
  },

  // Venue Card
  venueCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  venueCardSelected: {
    borderColor: colors.green,
  },
  venueCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    marginRight: 8,
  },
  cameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cameraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  cameraStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  venueAddress: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 8,
  },
  venueBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  venueTagText: {
    fontSize: 12,
    color: colors.grayLight,
    marginLeft: 3,
  },
  venueCameraCount: {
    fontSize: 12,
    color: colors.grayLight,
    marginRight: 12,
  },
  venuePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
    marginLeft: 'auto',
  },

  // Calendar
  calendar: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  calCellSelected: {
    backgroundColor: colors.green,
  },
  calCellToday: {
    borderWidth: 1,
    borderColor: colors.green,
  },
  calDayText: {
    fontSize: 14,
    color: colors.white,
  },
  calDayPast: {
    color: colors.grayDark,
  },
  calDaySelected: {
    color: '#000',
    fontWeight: '700',
  },

  // Time Slots
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grayLight,
    marginBottom: 10,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 72,
    alignItems: 'center',
  },
  timeSlotAvailable: {
    borderColor: colors.green,
    backgroundColor: 'transparent',
  },
  timeSlotUnavailable: {
    borderColor: colors.grayDark,
    backgroundColor: colors.grayDark,
  },
  timeSlotSelected: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.green,
  },
  timeSlotTextUnavailable: {
    color: colors.gray,
  },
  timeSlotTextSelected: {
    color: '#000',
  },

  // Section spacer
  sectionSpacer: {
    height: 12,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  summaryCost: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.green,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grayDark,
    marginVertical: 6,
  },

  // Reserve Button
  reserveButton: {
    backgroundColor: colors.green,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reserveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },

  // Reservation List
  reservationCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  reservationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reservationVenue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reservationDetail: {
    fontSize: 13,
    color: colors.grayLight,
    marginBottom: 4,
  },
  reservationCost: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
  },

  // Bottom
  bottomSpacer: {
    height: 40,
  },
});
