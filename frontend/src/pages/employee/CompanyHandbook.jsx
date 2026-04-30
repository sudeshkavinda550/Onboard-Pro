import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon, ShieldCheckIcon, BuildingOfficeIcon,
  ClockIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowLeftIcon, ArrowPathIcon, HeartIcon, AcademicCapIcon, LockClosedIcon,
  EnvelopeIcon, ChatBubbleLeftRightIcon, FolderIcon, WrenchScrewdriverIcon,
  GlobeAltIcon, KeyIcon, UserGroupIcon, MagnifyingGlassIcon, BoltIcon,
  SparklesIcon, UsersIcon, CurrencyDollarIcon, TrophyIcon, GiftIcon,
  BanknotesIcon, ChartBarIcon, CalendarDaysIcon, UserPlusIcon,
  ComputerDesktopIcon, DocumentTextIcon, ClipboardDocumentListIcon,
  ExclamationTriangleIcon, LightBulbIcon, RocketLaunchIcon,
  BriefcaseIcon, HandRaisedIcon, EyeIcon, CpuChipIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { taskApi } from '../../api/taskApi';
import authApi from '../../api/authApi';

/* ─── Per-employee localStorage helpers ──────────────────────── */
// Key includes userId so each employee's progress is completely isolated
const storageKey = (userId, taskId) =>
  `handbook_v2_${userId || 'guest'}_${taskId || 'none'}`;

const saveProgress = (userId, taskId, readArr) => {
  try {
    localStorage.setItem(storageKey(userId, taskId), JSON.stringify(readArr));
  } catch {}
};

const loadProgress = (userId, taskId) => {
  try {
    const raw = localStorage.getItem(storageKey(userId, taskId));
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
};

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to   { transform:rotate(360deg); } }
  .hb-nav:hover:not(.active) { background:#f1f5f9 !important; }
`;

/* ─── Shared style helpers ───────────────────────────────────── */
const H2 = { fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 14px' };
const H3 = { fontSize:16, fontWeight:800, color:'#0f172a', margin:'24px 0 12px' };
const P  = { fontSize:14.5, color:'#475569', lineHeight:1.75, marginBottom:14 };
const InfoBox = (bg,border,color) => ({ padding:'16px 20px', background:bg, borderRadius:14, border:`1px solid ${border}`, marginTop:8 });

/* ─── Watermark card wrapper ─────────────────────────────────── */
const WCard = ({ children, bg, border, color, WIcon, style = {} }) => (
  <div style={{ position:'relative', overflow:'hidden', background:bg, borderRadius:14, border:`1px solid ${border}`, ...style }}>
    {WIcon && (
      <div style={{ position:'absolute', right:-14, bottom:-14, pointerEvents:'none', opacity:0.10 }}>
        <WIcon style={{ width:88, height:88, color }} />
      </div>
    )}
    <div style={{ position:'relative', zIndex:1 }}>{children}</div>
  </div>
);

/* ─── Sections ───────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'welcome',
    title: 'Welcome to OnboardPro',
    icon: BookOpenIcon,
    color: '#6366f1',
    accent: '#eef2ff',
    border: '#e0e7ff',
    readTime: '5 min',
    content: () => (
      <div>
        <h2 style={H2}>Welcome to the Team</h2>
        <p style={P}>Congratulations on joining us! We're excited to have you on board. This handbook is your go-to guide for understanding how we work, what we stand for, and how we'll support you throughout your journey here.</p>
        <p style={P}>OnboardPro is a digital onboarding platform built to make your first days smooth, structured, and stress-free. Everything you need — your tasks, documents, training, and team information — is available right here in one place.</p>

        <div style={InfoBox('#eef2ff','#e0e7ff','#4338ca')}>
          <p style={{ fontSize:13, fontWeight:800, color:'#4338ca', margin:'0 0 8px' }}>How This Handbook Works</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {['Use the left panel to navigate between sections','Mark each section as read to track your progress','Complete all sections to finish this onboarding task','Your progress is automatically saved — pick up where you left off'].map((tip,i)=>(
              <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <span style={{ width:18, height:18, borderRadius:'50%', background:'#6366f1', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</span>
                <p style={{ fontSize:13, color:'#4338ca', margin:0 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <h3 style={H3}>Your First Week Checklist</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { day:'Day 1', task:'Complete your profile & upload required documents', color:'#6366f1', bg:'#eef2ff', border:'#e0e7ff', WIcon:DocumentTextIcon },
            { day:'Day 2', task:'Review and sign all HR policies and agreements', color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe', WIcon:ShieldCheckIcon },
            { day:'Day 3', task:'Set up your work tools and system access', color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0', WIcon:WrenchScrewdriverIcon },
            { day:'Day 5', task:'Meet your team and attend orientation session', color:'#f97316', bg:'#ffedd5', border:'#fed7aa', WIcon:UsersIcon },
          ].map(item=>(
            <WCard key={item.day} bg={item.bg} border={item.border} color={item.color} WIcon={item.WIcon} style={{ padding:'14px 16px' }}>
              <span style={{ fontSize:10.5, fontWeight:800, color:item.color, letterSpacing:'0.06em', textTransform:'uppercase' }}>{item.day}</span>
              <p style={{ fontSize:13, color:'#334155', margin:'4px 0 0', lineHeight:1.5 }}>{item.task}</p>
            </WCard>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'mission',
    title: 'Mission & Values',
    icon: BuildingOfficeIcon,
    color: '#3b82f6',
    accent: '#dbeafe',
    border: '#bfdbfe',
    readTime: '8 min',
    content: () => (
      <div>
        <h2 style={H2}>Our Mission</h2>
        <div style={{ padding:'20px 24px', background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:16, marginBottom:24 }}>
          <p style={{ fontSize:16, fontWeight:700, color:'#fff', margin:0, lineHeight:1.7 }}>
            "To streamline how organizations onboard their people — turning complex processes into clear, human-centered experiences that set employees up for long-term success."
          </p>
        </div>

        <h3 style={H3}>Our Vision</h3>
        <p style={P}>We believe the first days at a new job shape everything that follows. Our vision is a workplace where every new employee feels welcomed, informed, and empowered from day one.</p>

        <h3 style={H3}>Core Values</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {[
            { label:'People First',   desc:'We design every process around the human experience, not just efficiency.',        color:'#6366f1', bg:'#eef2ff', border:'#e0e7ff', WIcon:HandRaisedIcon },
            { label:'Transparency',   desc:'We communicate openly — no hidden policies, no surprise expectations.',             color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe', WIcon:EyeIcon },
            { label:'Excellence',     desc:'We hold ourselves to a high standard in everything we build and deliver.',          color:'#f97316', bg:'#ffedd5', border:'#fed7aa', WIcon:TrophyIcon },
            { label:'Growth Mindset', desc:'We encourage continuous learning and celebrate progress at every level.',           color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0', WIcon:RocketLaunchIcon },
            { label:'Integrity',      desc:'We do what we say, say what we mean, and hold each other accountable.',            color:'#a855f7', bg:'#f3e8ff', border:'#e9d5ff', WIcon:ShieldCheckIcon },
            { label:'Collaboration',  desc:'Great work is never done alone. We build together, support each other, and share credit.', color:'#22d3ee', bg:'#cffafe', border:'#a5f3fc', WIcon:UsersIcon },
          ].map(v=>(
            <WCard key={v.label} bg={v.bg} border={v.border} color={v.color} WIcon={v.WIcon} style={{ padding:'16px 18px' }}>
              <p style={{ fontSize:13.5, fontWeight:800, color:v.color, margin:'0 0 6px' }}>{v.label}</p>
              <p style={{ fontSize:13, color:'#475569', margin:0, lineHeight:1.6 }}>{v.desc}</p>
            </WCard>
          ))}
        </div>

        <h3 style={H3}>What We Expect From You</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {['Bring your authentic self to work every day','Communicate proactively — especially when blocked','Ask questions freely; no question is too small here','Support your colleagues and share your knowledge','Commit to growing in your role and helping others grow'].map((item,i)=>(
            <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #f1f5f9' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', flexShrink:0 }} />
              <p style={{ fontSize:13.5, color:'#334155', margin:0 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'policies',
    title: 'HR Policies',
    icon: ShieldCheckIcon,
    color: '#22c55e',
    accent: '#dcfce7',
    border: '#bbf7d0',
    readTime: '12 min',
    content: () => (
      <div>
        <h2 style={H2}>Code of Conduct</h2>
        <p style={P}>All employees are expected to uphold our Code of Conduct. This is not just policy — it defines who we are and how we treat each other.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
          {[
            { rule:'Respectful Communication',    detail:'Treat every colleague with dignity regardless of role, background, or seniority.' },
            { rule:'Confidentiality',              detail:'Never share sensitive company, client, or colleague information outside authorized channels.' },
            { rule:'Conflict of Interest',         detail:'Disclose any personal relationships or interests that could affect your professional judgment.' },
            { rule:'Responsible Resource Use',     detail:'Company tools, devices, and budgets are for professional use only.' },
            { rule:'Incident Reporting',           detail:'Report misconduct, harassment, or safety concerns immediately to HR or your manager.' },
          ].map((item,i)=>(
            <div key={i} style={{ padding:'12px 16px', background:'#f8fafc', borderRadius:12, border:'1px solid #f1f5f9', display:'flex', gap:12 }}>
              <span style={{ width:24, height:24, borderRadius:8, background:'#dcfce7', color:'#15803d', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</span>
              <div>
                <p style={{ fontSize:13.5, fontWeight:800, color:'#0f172a', margin:'0 0 2px' }}>{item.rule}</p>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 style={H3}>Work Hours & Attendance</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
          {[
            { label:'Standard Hours',     value:'9:00 AM – 5:00 PM',             color:'#6366f1', bg:'#eef2ff', border:'#e0e7ff', WIcon:ClockIcon },
            { label:'Work Week',          value:'Monday – Friday',               color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe', WIcon:CalendarDaysIcon },
            { label:'Flexible Work',      value:'Available with manager approval',color:'#f97316', bg:'#ffedd5', border:'#fed7aa', WIcon:SparklesIcon },
            { label:'Remote Policy',      value:'Hybrid — 3 days in office',     color:'#a855f7', bg:'#f3e8ff', border:'#e9d5ff', WIcon:ComputerDesktopIcon },
          ].map(row=>(
            <WCard key={row.label} bg={row.bg} border={row.border} color={row.color} WIcon={row.WIcon} style={{ padding:'14px 16px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:row.color, margin:'0 0 3px', letterSpacing:'0.04em', textTransform:'uppercase' }}>{row.label}</p>
              <p style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0 }}>{row.value}</p>
            </WCard>
          ))}
        </div>

        <h3 style={H3}>Leave Policy</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {[
            { label:'Annual Leave',         value:'20 days / year',      color:'#6366f1', bg:'#eef2ff', border:'#e0e7ff' },
            { label:'Sick Leave',           value:'10 days / year',      color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe' },
            { label:'Maternity Leave',      value:'16 weeks paid',       color:'#ec4899', bg:'#fdf2f8', border:'#fbcfe8' },
            { label:'Paternity Leave',      value:'4 weeks paid',        color:'#a855f7', bg:'#f3e8ff', border:'#e9d5ff' },
            { label:'Bereavement Leave',    value:'5 days per incident', color:'#64748b', bg:'#f1f5f9', border:'#e2e8f0' },
            { label:'Public Holidays',      value:'All gazetted holidays', color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0' },
          ].map(row=>(
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:row.bg, borderRadius:12, border:`1px solid ${row.border}` }}>
              <span style={{ fontSize:13.5, fontWeight:700, color:'#0f172a' }}>{row.label}</span>
              <span style={{ fontSize:13.5, fontWeight:800, color:row.color, background:'#fff', padding:'3px 12px', borderRadius:8, border:`1px solid ${row.border}` }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={InfoBox('#fef9c3','#fde68a','#92400e')}>
          <p style={{ fontSize:13, fontWeight:800, color:'#92400e', margin:'0 0 4px' }}>⚠️ Leave Application Process</p>
          <p style={{ fontSize:13, color:'#78350f', margin:0 }}>All leave requests must be submitted via the HR portal at least 3 working days in advance (except sick leave). Approvals are at manager discretion. Carry-forward of unused leave is capped at 5 days per year.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'it_security',
    title: 'IT & Security',
    icon: LockClosedIcon,
    color: '#f97316',
    accent: '#ffedd5',
    border: '#fed7aa',
    readTime: '8 min',
    content: () => (
      <div>
        <h2 style={H2}>IT Setup & Access</h2>
        <p style={P}>Your IT setup will be arranged before your first day. The following accounts and tools will be provisioned for you.</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
          {[
            { WIcon:EnvelopeIcon,             label:'Company Email',   detail:'Provided by IT on Day 1' },
            { WIcon:ChatBubbleLeftRightIcon,  label:'Slack',           detail:'Team communication platform' },
            { WIcon:FolderIcon,               label:'Google Drive',    detail:'Document storage & sharing' },
            { WIcon:ClipboardDocumentListIcon,label:'Project Tools',   detail:'Jira / Trello / Asana' },
            { WIcon:GlobeAltIcon,             label:'VPN Access',      detail:'Required for remote work' },
            { WIcon:KeyIcon,                  label:'Password Manager',detail:'1Password — mandatory use' },
          ].map(t=>(
            <WCard key={t.label} bg='#fff7ed' border='#fed7aa' color='#c2410c' WIcon={t.WIcon} style={{ padding:'20px 14px', textAlign:'center' }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#c2410c', margin:'0 0 4px' }}>{t.label}</p>
              <p style={{ fontSize:11.5, color:'#64748b', margin:0 }}>{t.detail}</p>
            </WCard>
          ))}
        </div>

        <h3 style={H3}>Security Policy</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
          {[
            { rule:'Strong Passwords',      detail:'Minimum 12 characters, use the company password manager. Never reuse passwords.' },
            { rule:'Two-Factor Auth (2FA)', detail:'Mandatory on all company accounts. Set up on your first day.' },
            { rule:'Device Security',       detail:'Lock your screen when away from your desk. Enable full-disk encryption.' },
            { rule:'Phishing Awareness',    detail:'Never click suspicious links. Report phishing attempts to security@company.com.' },
            { rule:'Data Handling',         detail:'No sensitive data on personal devices. Use company-approved cloud storage only.' },
            { rule:'Software Installation', detail:'Only install approved software. Submit requests via IT helpdesk for anything new.' },
          ].map((item,i)=>(
            <div key={i} style={{ padding:'12px 16px', background:'#fff7ed', borderRadius:12, border:'1px solid #fed7aa', display:'flex', gap:12 }}>
              <div style={{ width:24, height:24, borderRadius:8, background:'#ffedd5', color:'#c2410c', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>{i+1}</div>
              <div>
                <p style={{ fontSize:13.5, fontWeight:800, color:'#0f172a', margin:'0 0 2px' }}>{item.rule}</p>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={InfoBox('#fee2e2','#fca5a5','#991b1b')}>
          <p style={{ fontSize:13, fontWeight:800, color:'#991b1b', margin:'0 0 4px' }}>🚨 Security Incident?</p>
          <p style={{ fontSize:13, color:'#7f1d1d', margin:0 }}>If you suspect a breach, immediately contact IT at <strong>security@company.com</strong> or call the IT emergency line. Do not attempt to investigate on your own. Time is critical in security incidents.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'benefits',
    title: 'Benefits & Perks',
    icon: HeartIcon,
    color: '#a855f7',
    accent: '#f3e8ff',
    border: '#e9d5ff',
    readTime: '10 min',
    content: () => (
      <div>
        <h2 style={H2}>Your Benefits Package</h2>
        <p style={P}>We believe in taking care of our people. Here's a full overview of what's available to you as an employee.</p>

        <h3 style={H3}>Health & Wellness</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {[
            { WIcon:HeartIcon,        label:'Medical Insurance', detail:'Comprehensive inpatient & outpatient coverage for you and dependents', color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0' },
            { WIcon:SparklesIcon,     label:'Dental & Vision',   detail:'Full dental coverage + annual eyewear allowance of $300',             color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe' },
            { WIcon:LightBulbIcon,    label:'Mental Health',     detail:'6 free counseling sessions per year via our EAP provider',             color:'#a855f7', bg:'#f3e8ff', border:'#e9d5ff' },
            { WIcon:BoltIcon,         label:'Gym Membership',    detail:'Subsidized gym membership or $50/month wellness reimbursement',        color:'#f97316', bg:'#ffedd5', border:'#fed7aa' },
          ].map(b=>(
            <WCard key={b.label} bg={b.bg} border={b.border} color={b.color} WIcon={b.WIcon} style={{ padding:'20px 18px' }}>
              <p style={{ fontSize:14, fontWeight:800, color:b.color, margin:'0 0 6px' }}>{b.label}</p>
              <p style={{ fontSize:13, color:'#475569', margin:0, lineHeight:1.5 }}>{b.detail}</p>
            </WCard>
          ))}
        </div>

        <h3 style={H3}>Financial Benefits</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {[
            { label:'Retirement Plan (EPF/401k)', value:'6% employer match',          color:'#6366f1', bg:'#eef2ff', border:'#e0e7ff' },
            { label:'Performance Bonus',          value:'Up to 15% of annual salary', color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0' },
            { label:'Annual Salary Review',       value:'Every January',              color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe' },
            { label:'Referral Bonus',             value:'$1,000 per successful hire', color:'#f97316', bg:'#ffedd5', border:'#fed7aa' },
          ].map(row=>(
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:row.bg, borderRadius:12, border:`1px solid ${row.border}` }}>
              <span style={{ fontSize:13.5, fontWeight:700, color:'#0f172a' }}>{row.label}</span>
              <span style={{ fontSize:13.5, fontWeight:800, color:row.color, background:'#fff', padding:'3px 12px', borderRadius:8, border:`1px solid ${row.border}` }}>{row.value}</span>
            </div>
          ))}
        </div>

        <h3 style={H3}>Workplace Perks</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { WIcon:GiftIcon,        label:'Free Lunch Fridays' },
            { WIcon:SparklesIcon,    label:'Unlimited Snacks' },
            { WIcon:CpuChipIcon,     label:'Game Room' },
            { WIcon:EyeIcon,         label:'Quiet Focus Zones' },
            { WIcon:BriefcaseIcon,   label:'Free Parking' },
            { WIcon:HeartIcon,       label:'Parental Room' },
            { WIcon:BookOpenIcon,    label:'Library Access' },
            { WIcon:UserGroupIcon,   label:'Team Events' },
            { WIcon:RocketLaunchIcon,label:'Annual Retreat' },
          ].map(p=>(
            <WCard key={p.label} bg='#faf5ff' border='#ede9fe' color='#a855f7' WIcon={p.WIcon} style={{ padding:'18px 10px', textAlign:'center' }}>
              <p style={{ fontSize:12.5, fontWeight:700, color:'#6d28d9', margin:0 }}>{p.label}</p>
            </WCard>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'development',
    title: 'Learning & Growth',
    icon: AcademicCapIcon,
    color: '#22d3ee',
    accent: '#cffafe',
    border: '#a5f3fc',
    readTime: '7 min',
    content: () => (
      <div>
        <h2 style={H2}>Your Growth at Our Company</h2>
        <p style={P}>We invest in your development because your growth is our growth. From day one, you'll have access to a range of learning resources and career development programs.</p>

        <h3 style={H3}>Learning Resources</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {[
            { WIcon:CurrencyDollarIcon, label:'Training Budget',       detail:'$2,000 per year for courses, books, workshops, or certifications', color:'#22d3ee', bg:'#cffafe', border:'#a5f3fc' },
            { WIcon:AcademicCapIcon,    label:'LinkedIn Learning',     detail:'Full access to LinkedIn Learning — 16,000+ courses available',      color:'#3b82f6', bg:'#dbeafe', border:'#bfdbfe' },
            { WIcon:TrophyIcon,         label:'Certification Support', detail:'100% reimbursement for approved professional certifications',       color:'#a855f7', bg:'#f3e8ff', border:'#e9d5ff' },
            { WIcon:UserGroupIcon,      label:'Mentorship Program',    detail:'Paired with a senior mentor for your first 6 months',              color:'#22c55e', bg:'#dcfce7', border:'#bbf7d0' },
          ].map(b=>(
            <WCard key={b.label} bg={b.bg} border={b.border} color={b.color} WIcon={b.WIcon} style={{ padding:'20px 18px' }}>
              <p style={{ fontSize:14, fontWeight:800, color:b.color, margin:'0 0 6px' }}>{b.label}</p>
              <p style={{ fontSize:13, color:'#475569', margin:0, lineHeight:1.5 }}>{b.detail}</p>
            </WCard>
          ))}
        </div>

        <h3 style={H3}>Career Progression Framework</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:24 }}>
          {[
            { level:'Junior',    timeline:'0–2 years',  focus:'Learning fundamentals, task execution, mentorship', color:'#22c55e' },
            { level:'Mid-Level', timeline:'2–4 years',  focus:'Independent work, cross-team collaboration, ownership', color:'#3b82f6' },
            { level:'Senior',    timeline:'4–7 years',  focus:'Technical leadership, project ownership, mentoring others', color:'#a855f7' },
            { level:'Lead/Principal', timeline:'7+ years', focus:'Strategic decisions, organizational influence, people development', color:'#f97316' },
          ].map((level,i)=>(
            <div key={level.level} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'12px 0', borderBottom: i<3 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width:3, height:48, background:level.color, borderRadius:99, flexShrink:0, marginTop:4 }} />
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0 }}>{level.level}</p>
                  <span style={{ fontSize:11, fontWeight:700, padding:'1px 8px', borderRadius:20, background:'#f1f5f9', color:'#64748b' }}>{level.timeline}</span>
                </div>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>{level.focus}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={InfoBox('#cffafe','#a5f3fc','#0e7490')}>
          <p style={{ fontSize:13, fontWeight:800, color:'#0e7490', margin:'0 0 4px' }}>Performance Reviews</p>
          <p style={{ fontSize:13, color:'#164e63', margin:0 }}>Formal performance reviews happen every 6 months (June & December). Your manager will set goals with you in the first 30 days. You'll also have monthly 1-on-1 check-ins throughout the year.</p>
        </div>
      </div>
    ),
  },
];



/* ─── Spinner ────────────────────────────────────────────────── */
const Spin = () => <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />;

/* ─── Main Component ─────────────────────────────────────────── */
const CompanyHandbook = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const taskId    = location.state?.taskId;
  const taskTitle = location.state?.taskTitle;
  const taskData  = location.state?.taskData;   // full task object if passed
  const returnTo  = location.state?.returnTo || '/employee/tasks';

  const [activeId,      setActiveId]      = useState('welcome');
  const [readSections,  setReadSections]  = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [completing,    setCompleting]    = useState(false);
  const [userId,        setUserId]        = useState(null);

  const totalSections = SECTIONS.length;
  const active        = SECTIONS.find(s => s.id === activeId);
  const currentIndex  = SECTIONS.findIndex(s => s.id === activeId);
  const allRead       = readSections.size === totalSections;
  const pct           = Math.round((readSections.size / totalSections) * 100);

  /* ── Load persisted progress on mount — per employee ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch current user ID — progress is keyed per employee
      let uid = null;
      try {
        const profileRes = await authApi.getProfile();
        uid = profileRes?.data?.id || profileRes?.data?.employee_id || null;
      } catch {}
      setUserId(uid);
      // Restore progress from localStorage using per-employee key
      const restored = loadProgress(uid, taskId);
      setReadSections(restored);
      setLoading(false);
    })();
  }, [taskId]);

  /* ── Mark a section as read & persist to localStorage ── */
  const markRead = useCallback((id) => {
    setReadSections(prev => {
      if (prev.has(id)) return prev;
      const next = new Set([...prev, id]);
      // Save immediately — synchronous, no async needed
      saveProgress(userId, taskId, Array.from(next));
      return next;
    });
  }, [userId, taskId]);

  /* ── Navigate to section (auto-marks current as read) ── */
  const goTo = (id) => {
    markRead(activeId);
    setActiveId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Complete the task ── */
  const handleCompleteTask = async () => {
    if (!taskId) { toast.info('No task linked to this handbook.'); return; }
    if (!allRead) { toast.warning(`Please read all ${totalSections} sections before completing.`); return; }
    if (!window.confirm('Mark the Company Handbook task as complete?')) return;
    setCompleting(true);
    try {
      await taskApi.updateTaskStatus(taskId, { status: 'completed' });
      // Clear this employee's progress from localStorage
      try { localStorage.removeItem(storageKey(userId, taskId)); } catch {}
      toast.success('Company Handbook completed! ✅');
      navigate(returnTo, { state: { successMessage: 'Company Handbook task completed!' } });
    } catch {
      toast.error('Failed to mark task as complete. Please try again.');
    } finally { setCompleting(false); }
  };

  const handleBack = () => {
    if (taskId && readSections.size < totalSections) {
      if (window.confirm('You haven\'t finished all sections. Leave anyway?')) navigate(returnTo);
    } else {
      navigate(returnTo);
    }
  };

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', fontFamily:"'Plus Jakarta Sans',sans-serif", gap:14 }}>
      <style>{STYLES}</style>
      <div style={{ position:'relative', width:44, height:44 }}>
        <div style={{ position:'absolute', inset:0, border:'4px solid #e2e8f0', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, border:'4px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      </div>
      <p style={{ fontSize:13.5, color:'#64748b', fontWeight:600 }}>Restoring your reading progress…</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:'28px 28px 60px' }}>
      <style>{STYLES}</style>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Task banner ── */}
        {taskId && (
          <div style={{ background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:16, padding:'14px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, animation:'slideUp 0.4s ease-out both', border:'1px solid #475569' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div>
                <p style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, margin:'0 0 1px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Active Onboarding Task</p>
                <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0 }}>{taskTitle || 'Read Company Handbook'}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12.5, color:'#94a3b8', fontWeight:600 }}>{readSections.size}/{totalSections} read</span>
              <button onClick={handleBack} style={{ padding:'7px 16px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', borderRadius:9, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, animation:'slideUp 0.5s ease-out both' }}>
          <div>
            {!taskId && (
              <button onClick={handleBack} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#64748b', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', marginBottom:10, padding:0 }}
                onMouseEnter={e=>e.currentTarget.style.color='#6366f1'} onMouseLeave={e=>e.currentTarget.style.color='#64748b'}>
                ← Back to Tasks
              </button>
            )}
            <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0 }}>Company Handbook</h1>
            <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Your complete guide to policies, benefits, and how we work</p>
          </div>
          <div style={{ background:'#fff', borderRadius:14, padding:'10px 18px', border:'1px solid #e2e8f0', flexShrink:0 }}>
            <p style={{ fontSize:11, color:'#94a3b8', margin:'0 0 1px', fontWeight:600 }}>Total read time</p>
            <p style={{ fontSize:13.5, fontWeight:800, color:'#0f172a', margin:0 }}>~50 minutes</p>
          </div>
        </div>

        {/* ── Grid layout ── */}
        <div style={{ display:'grid', gridTemplateColumns:'272px 1fr', gap:18, alignItems:'start' }}>

          {/* ── Sidebar ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'slideUp 0.5s ease-out 100ms both' }}>

            {/* Nav */}
            <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', background:'linear-gradient(135deg,#1e293b,#334155)', borderBottom:'1px solid #334155' }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:'#fff', margin:'0 0 2px' }}>Contents</h2>
                <p style={{ fontSize:11.5, color:'#94a3b8', margin:0 }}>{readSections.size} of {totalSections} sections read</p>
              </div>
              <nav style={{ padding:'8px' }}>
                {SECTIONS.map((sec, i) => {
                  const isActive = activeId === sec.id;
                  const isRead   = readSections.has(sec.id);
                  return (
                    <button key={sec.id} onClick={() => goTo(sec.id)}
                      className={`hb-nav${isActive ? ' active' : ''}`}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 11px', borderRadius:12, marginBottom:3, border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                        background: isActive ? sec.color : 'transparent', animation:`slideUp 0.4s ease-out ${i*40}ms both` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ textAlign:'left' }}>
                          <p style={{ fontSize:12.5, fontWeight:700, margin:0, color: isActive ? '#fff' : '#0f172a' }}>{sec.title}</p>
                          <p style={{ fontSize:10.5, margin:0, color: isActive ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>{sec.readTime}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Progress */}
            <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', padding:'18px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Reading Progress</p>
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:12.5, color:'#64748b' }}>Completed</span>
                  <span style={{ fontSize:12.5, fontWeight:800, color:'#0f172a' }}>{readSections.size}/{totalSections}</span>
                </div>
                <div style={{ height:8, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius:99, transition:'width 0.6s ease-out' }} />
                </div>
                <p style={{ fontSize:11.5, fontWeight:800, color:'#6366f1', margin:'5px 0 0', textAlign:'right' }}>{pct}%</p>
              </div>

              {/* Mark current as read */}
              <button onClick={() => markRead(activeId)} disabled={readSections.has(activeId)}
                style={{ width:'100%', padding:'9px', borderRadius:11, border:'none', cursor: readSections.has(activeId) ? 'default' : 'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, marginBottom:10, transition:'all 0.15s',
                  background: readSections.has(activeId) ? '#f1f5f9' : `linear-gradient(90deg,${active?.color},${active?.color}cc)`,
                  color:      readSections.has(activeId) ? '#94a3b8' : '#fff' }}>
                {readSections.has(activeId)
                  ? <span>✓ Section Read</span>
                  : 'Mark Section as Read'}
              </button>

              {/* Complete task */}
              {taskId && (
                <button onClick={handleCompleteTask} disabled={!allRead || completing}
                  style={{ width:'100%', padding:'10px', borderRadius:11, border:'none', cursor:(!allRead||completing)?'not-allowed':'pointer', fontFamily:'inherit', fontSize:13, fontWeight:800, transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    background: allRead ? 'linear-gradient(90deg,#22c55e,#16a34a)' : '#f1f5f9',
                    color:      allRead ? '#fff' : '#94a3b8',
                    boxShadow:  allRead ? '0 4px 14px rgba(34,197,94,0.35)' : 'none' }}>
                  {completing ? <><Spin /> Completing…</>
                    : allRead  ? <>Complete Task</>
                    : `Read all ${totalSections} sections first`}
                </button>
              )}


            </div>
          </div>

          {/* ── Content panel ── */}
          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', animation:'slideUp 0.5s ease-out 160ms both' }}>

            {/* Content header */}
            <div style={{ padding:'22px 28px', borderBottom:'1px solid #1e293b', background:'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
              {/* Header watermark icon */}
              <div style={{ position:'absolute', right:-20, top:'50%', transform:'translateY(-50%)', opacity:0.06, pointerEvents:'none' }}>
                {active && <active.icon style={{ width:140, height:140, color:'#fff' }} />}
              </div>
              <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:0 }}>
                <div>
                  <h2 style={{ fontSize:19, fontWeight:800, color:'#fff', margin:0 }}>{active?.title}</h2>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', margin:'3px 0 0', fontWeight:600 }}>
                    Section {currentIndex + 1} of {totalSections} · {active?.readTime} read
                  </p>
                </div>
              </div>
              {readSections.has(activeId) && (
                <span style={{ position:'relative', zIndex:1, display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:99, background:'rgba(34,197,94,0.18)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.30)', whiteSpace:'nowrap' }}>
                  ✓ Read
                </span>
              )}
            </div>

            {/* Body */}
            <div style={{ padding:'30px 34px', minHeight:420, animation:'fadeIn 0.25s ease-out both' }} key={activeId}>
              {active?.content()}
            </div>

            {/* Bottom nav */}
            <div style={{ padding:'18px 28px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button onClick={() => { if (currentIndex > 0) goTo(SECTIONS[currentIndex-1].id); }} disabled={currentIndex===0}
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:11, border:'1.5px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, fontWeight:700, cursor:currentIndex===0?'not-allowed':'pointer', opacity:currentIndex===0?0.4:1, fontFamily:'inherit', transition:'all 0.15s' }}
                onMouseEnter={e=>{ if(currentIndex>0){ e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#6366f1'; }}}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#475569'; }}>
                ← Previous
              </button>

              {/* Dot nav */}
              <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                {SECTIONS.map((sec, i) => (
                  <button key={sec.id} onClick={() => goTo(sec.id)}
                    style={{ width: i===currentIndex ? 22 : 7, height:7, borderRadius:99, border:'none', cursor:'pointer', transition:'all 0.3s ease',
                      background: i===currentIndex ? active?.color : readSections.has(sec.id) ? '#22c55e' : '#e2e8f0' }} />
                ))}
              </div>

              {currentIndex < totalSections - 1 ? (
                <button onClick={() => goTo(SECTIONS[currentIndex+1].id)}
                  style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:11, border:'none', background:active?.color, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', boxShadow:`0 4px 12px ${active?.color}44` }}>
                  Next →
                </button>
              ) : taskId ? (
                <button onClick={handleCompleteTask} disabled={!allRead || completing}
                  style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:11, border:'none', fontSize:13, fontWeight:800, cursor:(!allRead||completing)?'not-allowed':'pointer', fontFamily:'inherit', transition:'all 0.15s',
                    background: allRead ? 'linear-gradient(90deg,#22c55e,#16a34a)' : '#f1f5f9',
                    color:      allRead ? '#fff' : '#94a3b8',
                    boxShadow:  allRead ? '0 4px 14px rgba(34,197,94,0.35)' : 'none' }}>
                  {completing ? <><Spin /> Completing…</> : <>Complete Task</>}
                </button>
              ) : (
                <div style={{ width:80 }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHandbook;