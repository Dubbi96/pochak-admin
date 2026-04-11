import { useState } from 'react';
import { LuSend } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PartnershipPage() {
  const [form, setForm] = useState({ company: '', name: '', email: '', phone: '', message: '' });
  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-[600px]">
      <h1 className="text-2xl font-bold text-foreground mb-2">제휴문의</h1>
      <p className="text-[14px] text-muted-foreground mb-8">포착과 함께 성장할 파트너를 찾고 있습니다.</p>

      <div className="flex flex-col gap-4">
        {[
          { key: 'company', label: '회사/단체명', placeholder: '회사/단체명을 입력해주세요' },
          { key: 'name', label: '담당자명', placeholder: '담당자명을 입력해주세요' },
          { key: 'email', label: '이메일', placeholder: 'email@example.com' },
          { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-[14px] text-muted-foreground mb-1.5">{label}</label>
            <Input type="text" value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
        <div>
          <label className="block text-[14px] text-muted-foreground mb-1.5">문의 내용</label>
          <textarea value={form.message} onChange={(e) => update('message', e.target.value)}
            placeholder="제휴 관련 문의 내용을 입력해주세요..."
            className="w-full rounded-lg bg-card border border-border-subtle px-4 py-2.5 text-[14px] text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/40 transition-colors h-32 resize-none"
          />
        </div>
        <Button className="w-full mt-2">
          <LuSend className="w-4 h-4" /> 제출하기
        </Button>
      </div>
    </div>
  );
}
