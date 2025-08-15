import React from 'react';

// Gentleman's Refined Color Palette - แนวสุภาพบุรุษ
export const CINESTORY_ACCENTS = {
  // Core Sophisticated Colors - สีหลักที่หรูหรา
  navy: "#1e293b",          // Deep navy blue
  charcoal: "#374151",      // Charcoal gray
  slate: "#475569",         // Slate blue
  
  // Refined Metals - โลหะหรูหรา
  gold: "#d4af37",          // Muted gold
  silver: "#94a3b8",        // Sophisticated silver
  bronze: "#cd7f32",        // Refined bronze
  
  // Supporting Tones - สีสนับสนุน
  warmGray: "#6b7280",      // Warm gray
  coolGray: "#64748b",      // Cool gray
  pearl: "#f8fafc",         // Pearl white
  
  // Accent Colors - สีเน้น (ใช้น้อย)
  blue: "#3b82f6",          // Classic blue
  teal: "#0f766e",          // Deep teal
  amber: "#d97706",         // Warm amber
  
  // Legacy Colors (เก็บไว้เพื่อ compatibility)
  purple: "#6b46c1",
  violet: "#8b5cf6",
  magenta: "#ec4899",
  cyan: "#06b6d4",
  
  // Dark Matter - ใช้สำหรับพื้นหลัง
  darkNavy: "#0f172a",      // Very dark navy
  darkCharcoal: "#111827",  // Very dark charcoal
  cosmic: "#030712",        // Deep cosmic
  
  // AI Metallic - เงินฟ้าเมทาลิคสำหรับ AI (ปรับให้อ่อนลง)
  metallicBlue: "#64748b",      // Softer slate
  silverBlue: "#94a3b8",        // Refined silver blue
  steelBlue: "#475569",         // Muted steel blue
  chromaBlue: "#64748b",        // Subdued chrome blue
} as const;

// Tool Type to Color Mapping - แมปสีเครื่องมือ (ปรับให้อ่อนลง)
export const TOOL_ACCENTS = {
  studio: CINESTORY_ACCENTS.navy,        // Navy for studio
  autocut: CINESTORY_ACCENTS.charcoal,   // Charcoal for AI
  color: CINESTORY_ACCENTS.slate,        // Slate for color
  audio: CINESTORY_ACCENTS.warmGray,     // Warm gray for audio
} as const;

// Ecosystem Tool Colors (ปรับให้ refined)
export const ECOSYSTEM_ACCENTS = {
  filmConnect: CINESTORY_ACCENTS.teal,
  rightsVault: CINESTORY_ACCENTS.gold,
  distributeNet: CINESTORY_ACCENTS.navy,
  filmMarket: CINESTORY_ACCENTS.amber,
  cinemaLink: CINESTORY_ACCENTS.slate,
  ecosystemHub: CINESTORY_ACCENTS.silver,
} as const;

// CineStory Theme Context
export interface CineStoryTheme {
  mode: 'dark' | 'light';
  language: 'EN' | 'TH';
  accents: typeof CINESTORY_ACCENTS;
  toolAccents: typeof TOOL_ACCENTS;
  ecosystemAccents: typeof ECOSYSTEM_ACCENTS;
}

const CineStoryThemeContext = React.createContext<CineStoryTheme>({
  mode: 'dark',
  language: 'EN',
  accents: CINESTORY_ACCENTS,
  toolAccents: TOOL_ACCENTS,
  ecosystemAccents: ECOSYSTEM_ACCENTS,
});

export const useCineStoryTheme = () => React.useContext(CineStoryThemeContext);

export const CineStoryThemeProvider: React.FC<{
  children: React.ReactNode;
  theme: CineStoryTheme;
}> = ({ children, theme }) => (
  <CineStoryThemeContext.Provider value={theme}>
    {children}
  </CineStoryThemeContext.Provider>
);

// Utility Functions - Refined Effects
export const getToolAccent = (type: keyof typeof TOOL_ACCENTS) => TOOL_ACCENTS[type];

export const createSubtleGlow = (color: string, intensity = 4) => 
  `0 0 ${intensity}px ${color}20, 0 0 ${intensity * 2}px ${color}10`; // ลด intensity ลงมาก

export const createRefinedShadow = (color: string, depth = 2) => 
  `0 ${depth}px ${depth * 4}px ${color}15, 0 ${depth}px ${depth * 2}px ${color}10`; // เน้น depth แทน glow

export const createElegantBorder = (color: string, opacity = 0.2) => 
  `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`; // เส้นขอบหรูหรา

// Film Industry Constants (ปรับให้เหมาะกับแนวใหม่)
export const FILM_CONSTANTS = {
  ASPECT_RATIOS: {
    widescreen: '16 / 9',
    cinema: '21 / 9',
    standard: '4 / 3',
    portrait: '9 / 16',
  },
  
  ANIMATION_DURATIONS: {
    ambient: '12s',         // ช้าลง, elegant
    interaction: '400ms',   // นุ่มนวลกว่า
    transition: '350ms',    // smooth
    cinematic: '16s',       // ช้าแต่หรูหรา
  },

  GRID_PATTERNS: {
    standard: 'linear-gradient(90deg, {color}10 1px, transparent 1px), linear-gradient({color}10 1px, transparent 1px)', // ลด opacity ลงเยอะ
    elegant: 'repeating-linear-gradient(0deg, transparent 0, transparent 12px, {color}08 13px)', // pattern ที่ subtle
  },

  BREAKPOINTS: {
    mobile: '640px',
    tablet: '768px', 
    desktop: '1024px',
    wide: '1280px',
  },
  
  // Typography Scale (ปรับให้เหมาะสม)
  TYPOGRAPHY: {
    hero: 'text-6xl lg:text-7xl',        // ลดลงจาก text-8xl/9xl
    large: 'text-4xl lg:text-5xl',       // ลดลงจาก text-6xl/7xl
    medium: 'text-2xl lg:text-3xl',      // ลดลงจาก text-4xl/5xl
    body: 'text-lg lg:text-xl',          // ลดลงจาก text-2xl/3xl
    small: 'text-base lg:text-lg',       // ขนาดปกติ
  },
} as const;

// Film Production Workflow Types
export type FilmProductionStage = 
  | 'pre-production'
  | 'production'
  | 'post-production'
  | 'distribution'
  | 'exhibition';

export type FilmRole = 
  | 'director'
  | 'producer'
  | 'editor'
  | 'colorist'
  | 'sound-designer'
  | 'distributor'
  | 'exhibitor';

export type CineStoryTool = 
  | 'studio'
  | 'autocut'
  | 'color'
  | 'audio';

export type EcosystemTool = 
  | 'filmConnect'
  | 'rightsVault'
  | 'distributeNet'
  | 'filmMarket'
  | 'cinemaLink'
  | 'ecosystemHub';

// Content Localization (ปรับข้อความให้ refined)
export const LOCALIZED_CONTENT = {
  EN: {
    tagline: "Distinguished Film Production Ecosystem",
    subtitle: "Refined tools for discerning filmmakers",
    tools: {
      studio: "Complete project orchestration",
      autocut: "Intelligent editing assistance",
      color: "Professional color grading",
      audio: "Cinematic audio production",
    },
    ecosystem: {
      filmConnect: "Industry Professional Network",
      rightsVault: "IP Rights & Asset Management",
      distributeNet: "Global Distribution Platform",
      filmMarket: "Content Licensing Marketplace",
      cinemaLink: "Cinema & Exhibition Network",
      ecosystemHub: "Integrated Workflow Center",
    },
    actions: {
      launchTool: "Launch Tool",
      newProject: "New Project",
      backToHome: "Back to Home",
      enterWorkspace: "Enter Workspace",
    },
  },
  TH: {
    tagline: "ระบบนิเวศการผลิตภาพยนตร์ระดับสูง",
    subtitle: "เครื่องมือหรูหราสำหรับผู้สร้างภาพยนตร์ระดับมืออาชีพ",
    tools: {
      studio: "การจัดการโปรเจกต์แบบครบครัน",
      autocut: "ผู้ช่วยตัดต่ออัจฉริยะ",
      color: "การปรับสีระดับมืออาชีพ",
      audio: "การผลิตเสียงภาพยนตร์",
    },
    ecosystem: {
      filmConnect: "เครือข่ายผู้เชี่ยวชาญอุตสาหกรรม",
      rightsVault: "จัดการลิขสิทธิ์และทรัพย์สิน",
      distributeNet: "แพลตฟอร์มจำหน่ายทั่วโลก",
      filmMarket: "ตลาดซื้อขายเนื้อหา",
      cinemaLink: "เครือข่ายโรงภาพยนตร์",
      ecosystemHub: "ศูนย์กลางการทำงานแบบบูรณาการ",
    },
    actions: {
      launchTool: "เปิดเครื่องมือ",
      newProject: "โปรเจกต์ใหม่",
      backToHome: "กลับสู่หน้าแรก",
      enterWorkspace: "เข้าสู่พื้นที่ทำงาน",
    },
  },
} as const;

export const getLocalizedContent = (lang: 'EN' | 'TH') => LOCALIZED_CONTENT[lang];