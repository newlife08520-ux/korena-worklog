'use client';
import React, { useMemo, useState, useEffect } from 'react';

type Dept = '行銷'|'設計';
type Status = '未開始'|'進行中'|'已完成'|'延後';

export type WorkLog = {
  id: string;
  date: string;
  owner: string;
  role: Dept;
  project?: string;
  title: string;
  details: string;
  status: Status;
  blockers?: string;
  planTomorrow?: string;
  metrics?: { reach:number; engage:number; convert:number; budget:number };
  attachments?: { label:string; url:string }[];
};

export default function Worklog() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function fetchLogs() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch('/api/worklogs?' + params.toString());
    const data = await res.json();
    setLogs(data.items);
  }
  useEffect(() => { fetchLogs(); }, []);

  const kpi = useMemo(()=>{
    const total = logs.length;
    const done = logs.filter(l=>l.status==='已完成').length;
    const doing = logs.filter(l=>l.status==='進行中').length;
    const delayed = logs.filter(l=>l.status==='延後').length;
    const progress = total ? Math.round(done/total*100) : 0;
    const reach = logs.reduce((s,l)=>s+(l.metrics?.reach||0),0);
    const engage = logs.reduce((s,l)=>s+(l.metrics?.engage||0),0);
    const convert = logs.reduce((s,l)=>s+(l.metrics?.convert||0),0);
    const budget = logs.reduce((s,l)=>s+(l.metrics?.budget||0),0);
    return { total, done, doing, delayed, progress, reach, engage, convert, budget };
  }, [logs]);

  async function createDemo() {
    const res = await fetch('/api/worklogs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ demo:true })});
    if (res.ok) fetchLogs();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight korena-title">KORENA 工作日誌</h1>
          <p className="text-sm text-muted">行銷 × 設計｜簡約高級、好填好看、可視化 KPI</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={fetchLogs}>重新整理</button>
          <button className="btn btn-primary" onClick={createDemo}>匯入示例資料</button>
        </div>
      </div>

      {/* KPI */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5"><div className="text-xs text-muted">完成率</div><div className="mt-1 text-2xl font-semibold korena-title">{kpi.progress}%</div><div className="text-xs text-muted mt-1">{kpi.done}/{kpi.total} 個任務</div></div>
        <div className="card p-5"><div className="text-xs text-muted">進行中</div><div className="mt-1 text-2xl font-semibold korena-title">{kpi.doing}</div></div>
        <div className="card p-5"><div className="text-xs text-muted">延後</div><div className="mt-1 text-2xl font-semibold korena-title">{kpi.delayed}</div></div>
        <div className="card p-5"><div className="text-xs text-muted">Reach / 互動 / 轉單</div><div className="mt-1 text-2xl font-semibold korena-title">{kpi.reach.toLocaleString()} / {kpi.engage.toLocaleString()} / {kpi.convert}</div><div className="text-xs text-muted mt-1">預算 {kpi.budget.toLocaleString()} NTD</div></div>
      </div>

      {/* Filters */}
      <div className="card mt-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm text-muted">篩選</span>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input className="input flex-1" placeholder="關鍵字（人名 / 專案 / 標題）" value={query} onChange={e=>setQuery(e.target.value)} />
            <select className="input w-[140px]" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="">全部部門</option>
              <option value="行銷">行銷</option>
              <option value="設計">設計</option>
            </select>
            <select className="input w-[140px]" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">全部狀態</option>
              <option>未開始</option>
              <option>進行中</option>
              <option>已完成</option>
              <option>延後</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="date" className="input w-[160px]" value={from} onChange={e=>setFrom(e.target.value)}/>
              <span className="text-muted">—</span>
              <input type="date" className="input w-[160px]" value={to} onChange={e=>setTo(e.target.value)}/>
            </div>
            <button className="btn" onClick={fetchLogs}>套用</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">人員</th>
              <th className="px-4 py-3">部門</th>
              <th className="px-4 py-3">專案</th>
              <th className="px-4 py-3">標題 / 說明</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">成效</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((r)=>(
              <tr key={r.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 whitespace-nowrap">{r.date.slice(0,10)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.owner}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.role}</td>
                <td className="px-4 py-3 min-w-[220px]">{r.project||'—'}</td>
                <td className="px-4 py-3 min-w-[320px]">
                  <div className="font-medium">{r.title}</div>
                  <div className="mt-1 text-muted">{r.details}</div>
                  {r.attachments?.length ? <div className="mt-2 flex flex-wrap gap-2">{r.attachments.map((a,i)=>(
                    <a key={i} href={a.url} className="korena-chip px-2.5 py-1 text-xs rounded-full">{a.label}</a>
                  ))}</div> : null}
                </td>
                <td className="px-4 py-3">
                  <span className={
                    'inline-block rounded-full px-2.5 py-1 text-xs ' + 
                    (r.status==='已完成' ? 'bg-emerald-100 text-emerald-700' :
                     r.status==='進行中' ? 'bg-blue-100 text-blue-700' :
                     r.status==='延後' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700')
                  }>{r.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.metrics ? <div className="space-x-2">
                    <span className="badge">Reach {r.metrics.reach.toLocaleString()}</span>
                    <span className="badge">互動 {r.metrics.engage.toLocaleString()}</span>
                    <span className="badge">轉單 {r.metrics.convert}</span>
                  </div> : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
          <p className="text-xs text-muted">© {new Date().getFullYear()} KORENA — Worklog Dashboard</p>
          <div className="flex gap-2">
            <a href="https://prisma.io" target="_blank" className="text-xs text-muted underline">Prisma</a>
            <a href="https://nextjs.org" target="_blank" className="text-xs text-muted underline">Next.js</a>
          </div>
      </div>
    </div>
  );
}
