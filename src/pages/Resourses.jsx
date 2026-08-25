import React, { useEffect, useState } from 'react'
import { FileCode2, FileText, BookMarked, Archive, Link2, Download, Search } from "lucide-react";
import { useCourse } from '../context/CourseContex';
import Loader from '../components/Loader';

const bookLinks = [
  { title: "You Don't Know JS (Yet)", author: "Kyle Simpson", category: "JavaScript", link: "https://github.com/getify/You-Dont-Know-JS.git"},
  { title: "Clean Code", author: "Robert C. Martin", category: "Best Practices", link: "https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29" },
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", category: "Career", link: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
  { title: "Design Patterns", author: "Gang of Four", category: "Architecture", link: "https://www.geeksforgeeks.org/system-design/gang-of-four-gof-design-patterns/" },
];

const iconMap = { pdf: FileText, notes: BookMarked, code: FileCode2, zip: FileCode2 };
const colorMap = { code: "#3b82f6", zip: "#3b82f6", pdf: "#f59e0b", notes: "#10b981" };

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "Link";
  const num = Number(bytes);
  if (num === 0) return "Link";
  const mb = num / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = num / 1024;
  return `${kb.toFixed(0)} KB`;
};

function Resourses() {
  const [query, setQuery] = useState("");
  const { getResources, resources, loading } = useCourse();

  useEffect(() => {
    getResources();
  }, []);

  const filtered = (resources || []).filter(
    (r) =>
      r.title?.toLowerCase().includes(query.toLowerCase()) ||
      r.lessons?.title?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className='px-4 sm:px-6 lg:px-8' style={{ fontFamily: "Inter, sans-serif" }}>
      {loading && <Loader/>}
      <div className="mb-6">
        <h1 style={{ color: "#e6edf3", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, marginBottom: "4px" }}>Manbalar</h1>
        <p className='text-[#8b949e] text-[13px]'>Barcha fayllar, ko'dlar, jadval va kitob havolalari shu yerda</p>
      </div>
      <div className="flex items-center gap-3 mb-5 px-4 rounded-2xl bg-[#1c2128] border-[1px] border-[rgba(255,255,255,0.08)] h-[48px]">
        <Search size={16} style={{ color: "#8b949e", flexShrink: 0 }} />
        <input type="text" placeholder="Manbalarni qidiring..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ background: "none", border: "none", outline: "none", color: "#e6edf3", fontSize: "14px", flex: 1, fontFamily: "Inter, sans-serif" }}/>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        {filtered.map((res) => { 
          const Icon = iconMap[res.file_type] || FileCode2; 
          const color = colorMap[res.file_type] || "#3b82f6";
          const displaySize = typeof res.file_size === "string" && res.file_size.includes("MB") 
            ? res.file_size 
            : formatFileSize(res.file_size);

          return (
            <a 
              download={res.file_type !== "notes"} 
              href={res.file_url} 
              target="_blank"
              rel="noreferrer"
              key={res.id} 
              className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] hover:border-[rgba(59,130,246,0.3)]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className='text-[#e6edf3] text-[13px] font-semibold overflow-hidden whitespace-nowrap'>{res.title}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className='text-[#8b949e] text-[11px]'>{res.lessons?.title || "Umumiy dars"}</span>
                  <span className='text-[#8b949e] text-[11px]'>·</span>
                  <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>{displaySize}</span>
                  <span className='text-[#8b949e] text-[11px]'>·</span>
                  <span className='text-[#8b949e] text-[11px]'>{new Date(res.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl flex-shrink-0 active:scale-95 bg-[rgba(59,130,246,0.12)] border-[1px] border-[rgba(59,130,246,0.25)] text-[#58a6ff] text-[12px] cursor-pointer">
                <Download size={12} /> <span className="hidden sm:inline">Yuklab olish</span>
              </button>
            </a>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#8b949e] text-[14px]">Manbalar topilmadi.</div>
        )}
      </div>
      <div className="rounded-2xl p-4 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-2 mb-4"> 
          <BookMarked size={15} style={{ color: "#3b82f6" }} />
          <span className='text-[#e6edf3] text-[14px] font-bold'>Tavsiya etilgan kitoblar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bookLinks.map((book) => (
            <a href={book.link} target="_blank" rel="noopener noreferrer" key={book.title} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 bg-[rgba(255,255,255,0.03)] border-[1px] border-[rgba(255,255,255,0.05)] hover:border-[rgba(59,130,246,0.3)]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[rgba(99,102,241,0.15)]">
                <BookMarked size={14} style={{ color: "#6366f1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className='text-[#e6edf3] text-[13px] font-semibold overflow-hidden whitespace-nowrap'>{book.title}</div>
                <div className='text-[#8b949e] text-[11px]'>{book.author} · {book.category}</div>
              </div>
              <Link2 size={12} style={{ color: "#8b949e", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Resourses