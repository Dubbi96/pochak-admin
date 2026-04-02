import { useState } from 'react';

export default function PartnershipPage() {
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 500) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.');
  };

  const inputClass =
    'w-full bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#666] outline-none transition-colors focus:border-[#00CC33]';

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#1A1A1A] px-6 py-10 lg:px-12">
      <h1 className="text-2xl font-bold text-white mb-8">제휴문의</h1>

      <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-8 max-w-[640px]">
        <p className="text-[14px] text-[#A6A6A6] mb-6">
          포착과의 제휴 및 협업에 관심이 있으시면 아래 양식을 작성해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] text-[#A6A6A6] mb-1.5">
              회사명
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="회사명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#A6A6A6] mb-1.5">
              담당자명
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="담당자명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#A6A6A6] mb-1.5">
              이메일
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#A6A6A6] mb-1.5">
              연락처
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="연락처를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#A6A6A6] mb-1.5">
              문의내용
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="문의내용을 입력하세요 (최대 500자)"
            />
            <p className="mt-1 text-right text-[12px] text-[#666]">
              {form.message.length}/500
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-colors"
          >
            제출
          </button>
        </form>
      </div>
    </div>
  );
}
