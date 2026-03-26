"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OwnerType } from "@/types/venue";
import type { AssetVisibility, LiveCreateRequest } from "@/types/content-asset";
import {
  createLiveAsset,
  getVenueOptions,
  getOrganizationOptions,
  getBranchOptions,
  getSportOptions,
} from "@/services/content-asset-api";

export default function LiveCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Options
  const [venueOptions, setVenueOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [orgOptions, setOrgOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [branchOptions, setBranchOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [sportOptions, setSportOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // Form state
  const [ownerType, setOwnerType] = useState<OwnerType>("B2B");
  const [organizationId, setOrganizationId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [price, setPrice] = useState("0");
  const [matchName, setMatchName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [sportId, setSportId] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [panoramaUrl, setPanoramaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [visibility, setVisibility] = useState<AssetVisibility>("PRIVATE");
  const [specificUserIds, setSpecificUserIds] = useState("");

  useEffect(() => {
    getVenueOptions().then(setVenueOptions);
    getOrganizationOptions().then(setOrgOptions);
    getSportOptions().then(setSportOptions);
  }, []);

  useEffect(() => {
    if (organizationId) {
      getBranchOptions(parseInt(organizationId, 10)).then(setBranchOptions);
      setBranchId("");
    } else {
      setBranchOptions([]);
      setBranchId("");
    }
  }, [organizationId]);

  const handleSave = async () => {
    if (!matchName.trim() || !venueId) return;
    setSaving(true);
    try {
      const data: LiveCreateRequest = {
        ownerType,
        organizationId: organizationId
          ? parseInt(organizationId, 10)
          : undefined,
        branchId: branchId ? parseInt(branchId, 10) : undefined,
        venueId: parseInt(venueId, 10),
        price: parseInt(price, 10) || 0,
        matchName: matchName.trim(),
        startTime,
        endTime,
        description: description.trim() || undefined,
        sportId: sportId ? parseInt(sportId, 10) : undefined,
        streamUrl: streamUrl.trim() || undefined,
        panoramaUrl: panoramaUrl.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        visibility,
        specificUserIds: visibility === "SPECIFIC" && specificUserIds
          ? specificUserIds.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      };
      await createLiveAsset(data);
      router.push("/contents/live");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <h1 className="text-xl font-bold text-gray-900">라이브 등록</h1>

      {/* 기본 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>

        {/* 구분 */}
        <div className="space-y-2">
          <Label>구분</Label>
          <RadioGroup
            value={ownerType}
            onValueChange={(v) => setOwnerType(v as OwnerType)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="B2B" id="ot-b2b" />
              <Label htmlFor="ot-b2b" className="font-normal">
                B2B
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="B2G" id="ot-b2g" />
              <Label htmlFor="ot-b2g" className="font-normal">
                B2G
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="B2C" id="ot-b2c" />
              <Label htmlFor="ot-b2c" className="font-normal">
                B2C
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 단체 & 지점 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>단체 선택</Label>
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger>
                <SelectValue placeholder="단체 선택" />
              </SelectTrigger>
              <SelectContent>
                {orgOptions.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>지점 선택</Label>
            <Select
              value={branchId}
              onValueChange={setBranchId}
              disabled={!organizationId}
            >
              <SelectTrigger>
                <SelectValue placeholder="지점 선택" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 구장 & 금액 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>구장 선택</Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger>
                <SelectValue placeholder="구장 선택" />
              </SelectTrigger>
              <SelectContent>
                {venueOptions.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>금액(뽈)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
            />
          </div>
        </div>

        {/* 경기 이름 */}
        <div className="space-y-1.5">
          <Label>
            경기 이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            placeholder="경기 이름을 입력하세요"
          />
        </div>

        {/* 시간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>시작 시간</Label>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>종료 시간</Label>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-1.5">
          <Label>설명</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 경기 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">경기 정보</h2>

        {/* 종목 */}
        <div className="space-y-1.5">
          <Label>종목 선택</Label>
          <Select value={sportId} onValueChange={setSportId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="종목 선택" />
            </SelectTrigger>
            <SelectContent>
              {sportOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* URLs */}
        <div className="space-y-1.5">
          <Label>스트림 URL</Label>
          <Input
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://stream.example.com/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>파노라마 URL</Label>
          <Input
            value={panoramaUrl}
            onChange={(e) => setPanoramaUrl(e.target.value)}
            placeholder="https://stream.example.com/pano/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>썸네일 URL</Label>
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://cdn.example.com/thumb/..."
          />
        </div>

        {/* 공개 범위 (ABAC video_acl) */}
        <div className="space-y-1.5">
          <Label>공개 범위</Label>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as AssetVisibility)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">전체 공개 (PUBLIC)</SelectItem>
              <SelectItem value="MEMBERS_ONLY">멤버만 (MEMBERS_ONLY)</SelectItem>
              <SelectItem value="PRIVATE">비공개 (PRIVATE)</SelectItem>
              <SelectItem value="SPECIFIC">특정 사용자 (SPECIFIC)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">
            ABAC video_acl 정책에 따라 접근 권한이 설정됩니다.
          </p>
        </div>

        {visibility === "SPECIFIC" && (
          <div className="space-y-1.5">
            <Label>허용 사용자 ID</Label>
            <Input
              value={specificUserIds}
              onChange={(e) => setSpecificUserIds(e.target.value)}
              placeholder="user123, user456 (쉼표 구분)"
            />
            <p className="text-xs text-gray-400">
              접근을 허용할 사용자 ID를 쉼표로 구분하여 입력하세요.
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/contents/live")}
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !matchName.trim() || !venueId}
        >
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
