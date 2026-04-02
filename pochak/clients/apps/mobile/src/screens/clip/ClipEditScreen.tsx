import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {analyticsService} from '../../services/analyticsService';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type ClipEditNavProp = NativeStackNavigationProp<RootStackParamList>;
type ClipEditRouteProp = RouteProp<RootStackParamList, 'ClipEdit'>;

type Visibility = 'public' | 'club' | 'private';

const VISIBILITY_OPTIONS: {key: Visibility; label: string}[] = [
  {key: 'public', label: '전체 공개'},
  {key: 'club', label: '클럽 공개'},
  {key: 'private', label: '비공개'},
];

// Auto-generated tags based on mock match info
const DEFAULT_TAGS = ['골프', 'KLPGA', '하이라이트'];

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ClipEditScreen() {
  const navigation = useNavigation<ClipEditNavProp>();
  const route = useRoute<ClipEditRouteProp>();
  const {startTime, endTime, sourceContentType, sourceContentId} =
    route.params;

  const clipDuration = endTime - startTime;

  // Auto-generate title from match info
  const [title, setTitle] = useState(
    `KLPGA 챔피언십 ${formatTime(startTime)}~${formatTime(endTime)}`,
  );
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([...DEFAULT_TAGS]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isSaving, setIsSaving] = useState(false);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(prev => prev.filter(t => t !== tagToRemove));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call clip creation API
      // await contentService.createClip({
      //   title, description, tags, visibility,
      //   startTime, endTime, sourceContentType, sourceContentId
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Analytics: track clip creation
      const clipId = `clip_${Date.now()}`;
      analyticsService.trackClipCreate(clipId, sourceContentId);

      Alert.alert('완료', '클립이 생성되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // Navigate back to the Player screen
            navigation.goBack();
          },
        },
      ]);
    } catch {
      Alert.alert('오류', '클립 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }, [title, description, tags, visibility, startTime, endTime, sourceContentType, sourceContentId, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>클립 만들기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Clip Preview Area */}
        <View style={styles.playerArea}>
          <MaterialIcons name="content-cut" size={36} color={GREEN} />
          <Text style={styles.playerPreviewTitle}>선택 구간 미리보기</Text>
          <View style={styles.timeRangeRow}>
            <Text style={styles.timeRangeText}>
              {formatTime(startTime)} ~ {formatTime(endTime)}
            </Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>
                {formatDuration(clipDuration)}
              </Text>
            </View>
          </View>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>
              {sourceContentType === 'live' ? 'LIVE' : 'VOD'}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>제목</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={text => setTitle(text.slice(0, 25))}
                placeholder="제목을 입력하세요"
                placeholderTextColor={GRAY}
                maxLength={25}
              />
              <Text style={styles.charCount}>{title.length}/25</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>설명</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={text => setDescription(text.slice(0, 300))}
                placeholder="설명을 입력하세요"
                placeholderTextColor={GRAY}
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {description.length}/300
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>태그</Text>
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity
                    style={styles.tagRemove}
                    onPress={() => handleRemoveTag(tag)}>
                    <Ionicons name="close" size={12} color={GRAY_LIGHT} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Text style={styles.tagHint}>경기 정보에서 자동 생성됩니다</Text>
          </View>

          {/* Visibility */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>클립 공개 여부</Text>
            <View style={styles.radioGroup}>
              {VISIBILITY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.radioItem}
                  onPress={() => setVisibility(option.key)}>
                  <View
                    style={[
                      styles.radioOuter,
                      visibility === option.key && styles.radioOuterActive,
                    ]}>
                    {visibility === option.key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}>
          <Text style={styles.saveButtonText}>
            {isSaving ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  headerRight: {
    width: 32,
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Player Preview Area
  playerArea: {
    height: 180,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playerPreviewTitle: {
    fontSize: 14,
    color: GRAY_LIGHT,
    marginTop: 4,
  },
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: WHITE,
  },
  durationBadge: {
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },
  sourceBadge: {
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  sourceBadgeText: {
    fontSize: 11,
    color: GRAY_LIGHT,
    fontWeight: '600',
  },
  // Form
  formSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 11,
    color: GRAY,
    marginLeft: 8,
  },
  textAreaContainer: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 100,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    paddingVertical: 0,
    minHeight: 70,
  },
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: GRAY_LIGHT,
  },
  tagRemove: {
    padding: 2,
  },
  tagHint: {
    fontSize: 11,
    color: GRAY,
    marginTop: 6,
  },
  // Visibility Radio
  radioGroup: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: GREEN,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  radioLabel: {
    fontSize: 14,
    color: WHITE,
  },
  // Bottom Buttons
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: GRAY_DARK,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY_LIGHT,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WHITE,
  },
});
