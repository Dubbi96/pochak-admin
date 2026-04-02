"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface FileUploadProps {
  label: string;
  accept?: string;
  currentUrl?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  description?: string;
}

export function FileUpload({
  label,
  accept = "image/*",
  currentUrl,
  onChange,
  description,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show currentUrl as preview when provided and no file selected
  useEffect(() => {
    if (currentUrl && !previewUrl) {
      setPreviewUrl(currentUrl);
    }
  }, [currentUrl, previewUrl]);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("JPG, PNG, WebP 파일만 업로드할 수 있습니다.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file, url);
    },
    [onChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndSet(file);
      }
      // Reset input so re-selecting the same file triggers onChange
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [validateAndSet],
  );

  const handleClear = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    onChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndSet(file);
      }
    },
    [validateAndSet],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const displayUrl = previewUrl;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {displayUrl ? (
        /* Preview state */
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={`${label} 미리보기`}
            className="h-32 max-w-full rounded-lg border border-gray-200 object-contain"
            onError={() => {
              // If image fails to load (e.g. bad currentUrl), clear preview
              setPreviewUrl(null);
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
            title="이미지 제거"
          >
            <X size={14} />
          </button>
          {/* Allow re-uploading by clicking the preview */}
          <button
            type="button"
            onClick={handleClick}
            className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="이미지 변경"
          >
            <Upload size={14} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            isDragOver
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          <ImageIcon
            size={28}
            className={isDragOver ? "text-emerald-500" : "text-gray-400"}
          />
          <p className="text-sm text-gray-500">
            클릭하여 파일을 선택하거나 드래그 앤 드롭하세요
          </p>
          <p className="text-xs text-gray-400">
            JPG, PNG, WebP (최대 10MB)
          </p>
        </div>
      )}

      {description && !error && (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
