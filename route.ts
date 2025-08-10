import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const role = searchParams.get('role') || undefined;
  const status = searchParams.get('status') || undefined;
  const from = searchParams.get('from') ? new Date(searchParams.get('from') as string) : undefined;
  const to = searchParams.get('to') ? new Date(searchParams.get('to') as string) : undefined;

  const items = await prisma.workLog.findMany({
    where: {
      AND: [
        q ? { OR: [
          { title: { contains: q } },
          { details: { contains: q } },
          { project: { name: { contains: q } } },
          { owner: { name: { contains: q } } },
        ] } : {},
        role ? { role: role as any } : {},
        status ? { status: status === '未開始' ? 'TODO' : status==='進行中' ? 'DOING' : status==='已完成' ? 'DONE' : 'DELAY' } as any : {},
        from ? { date: { gte: from } } : {},
        to ? { date: { lte: to } } : {},
      ]
    },
    include: { owner:true, project:true, metrics:true, attachments:true },
    orderBy: { date: 'desc' }
  });

  const map = (s: string)=> s==='TODO'?'未開始': s==='DOING'?'進行中': s==='DONE'?'已完成':'延後';

  const normalized = items.map(i => ({
    id: i.id,
    date: i.date.toISOString(),
    owner: i.owner.name,
    role: i.role as any,
    project: i.project?.name || null,
    title: i.title,
    details: i.details,
    status: map(i.status),
    blockers: i.blockers || '',
    planTomorrow: i.planTomorrow || '',
    metrics: i.metrics ? { reach: i.metrics.reach, engage: i.metrics.engage, convert: i.metrics.convert, budget: i.metrics.budget } : null,
    attachments: i.attachments.map(a=>({ label: a.label, url: a.url })),
  }));

  return NextResponse.json({ items: normalized });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  if (!('demo' in body)) return NextResponse.json({ ok:false, message:'Only demo seed supported here.' }, { status: 400 });

  // create demo data idempotently
  const exists = await prisma.user.findFirst({ where: { email: 'jessica@korena.tw' } });
  let jessica = exists ?? await prisma.user.create({ data: { name: 'Jessica Liu', email: 'jessica@korena.tw', role:'MEMBER', dept:'設計' as any } });
  let linnie = await prisma.user.upsert({ where: { email: 'linnie@korena.tw' }, update: {}, create: { name:'Linnie', email:'linnie@korena.tw', role:'MEMBER', dept:'行銷' as any } });
  let mo = await prisma.user.upsert({ where: { email: 'mo@korena.tw' }, update: {}, create: { name:'Mo', email:'mo@korena.tw', role:'MEMBER', dept:'行銷' as any } });

  const project618 = await prisma.project.upsert({ where: { id: 'p_618' }, update: {}, create: { id:'p_618', name:'618 活動 / 品牌形象', code:'618' } });
  const projectCaviar = await prisma.project.upsert({ where: { id: 'p_caviar' }, update: {}, create: { id:'p_caviar', name:'新品上市｜Caviar 8', code:'CAV8' } });
  const moPilates = await prisma.project.upsert({ where: { id: 'p_pilates' }, update: {}, create: { id:'p_pilates', name:'Mo Pilates 聯名', code:'PILATES' } });

  // seed 3 logs
  const logs = await Promise.all([
    prisma.workLog.create({
      data: {
        date: new Date('2025-06-21'),
        ownerId: jessica.id,
        role: '設計' as any,
        projectId: project618.id,
        title: '主視覺 KV 改版（深藍×金）',
        details: '完成 3 套版型；繳交 A/B 兩版動畫稿；待主管回饋',
        status: 'DOING',
        blockers: '等待 KOL 名單最終確認（置入文案）',
      }
    }),
    prisma.workLog.create({
      data: {
        date: new Date('2025-06-21'),
        ownerId: linnie.id,
        role: '行銷' as any,
        projectId: projectCaviar.id,
        title: 'Reels 腳本：拆封即鮮 × 雙層魚子專利',
        details: '完成 8 秒短版 + 15 秒長版腳本，安排 6/22 拍攝',
        status: 'DONE',
        metrics: { create: { reach: 58000, engage: 4200, convert: 86, budget: 15000 } },
      }
    }),
    prisma.workLog.create({
      data: {
        date: new Date('2025-06-20'),
        ownerId: mo.id,
        role: '行銷' as any,
        projectId: moPilates.id,
        title: '聯名活動頁（早鳥抽獎）',
        details: '完成 wireframe 與需求；等待設計套版',
        status: 'DELAY',
        blockers: '合作方素材延遲，Logo 版權聲明尚未簽回',
      }
    }),
  ]);

  return NextResponse.json({ ok:true, count: logs.length });
}
