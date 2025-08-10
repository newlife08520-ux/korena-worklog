import dynamic from 'next/dynamic';
const Worklog = dynamic(()=>import('@/components/Worklog'), { ssr:false });
export default function Page(){ return <Worklog/> }
