// UniGoh Admin Credentials (server-side validation in production)
// Roles: 'master' | 'university_admin'
export const ADMIN_ACCOUNTS = [
  {
    id: "admin-001",
    username: "komilovv77",
    password: "UniGoh@2026!",
    role: "master",
    name: "Abdulloh Komilov",
    email: "komilovabdulloh2023@gmail.com",
    avatar: "AK",
    color: "from-indigo-600 to-purple-600",
    university: null, // Master has access to ALL
    lastLogin: null
  },
  {
    id: "admin-002",
    username: "isft_admin",
    password: "ISFT@qabul2026",
    role: "university_admin",
    name: "ISFT Qabul Komissiyasi",
    email: "qabul@isft.uz",
    avatar: "IS",
    color: "from-blue-500 to-cyan-600",
    university: "isft-andijan",
    lastLogin: null
  },
  {
    id: "admin-003",
    username: "aipi_admin",
    password: "AIPI@qabul2026",
    role: "university_admin",
    name: "AIPI Qabul Komissiyasi",
    email: "qabul@aipi.uz",
    avatar: "AI",
    color: "from-emerald-500 to-teal-600",
    university: "aipi-andijan",
    lastLogin: null
  },
  {
    id: "admin-004",
    username: "kokand_admin",
    password: "KoqonUni@2026",
    role: "university_admin",
    name: "Qo'qon Universiteti Komissiya",
    email: "qabul@kokanduni.uz",
    avatar: "KU",
    color: "from-amber-500 to-orange-600",
    university: "kokand-uni",
    lastLogin: null
  },
  {
    id: "admin-005",
    username: "nordic_admin",
    password: "Nordic@2026secure",
    role: "university_admin",
    name: "Nordic Admissions Office",
    email: "admissions@nordicuni.uz",
    avatar: "NU",
    color: "from-sky-500 to-blue-600",
    university: "nordic-uni",
    lastLogin: null
  },
  {
    id: "admin-006",
    username: "emu_admin",
    password: "EMU@tibbiyot2026",
    role: "university_admin",
    name: "EMU Qabul Komissiyasi",
    email: "qabul@emu.uz",
    avatar: "EM",
    color: "from-rose-500 to-pink-600",
    university: "emu-university",
    lastLogin: null
  },
  {
    id: "admin-007",
    username: "team_admin",
    password: "TEAM@biznes2026",
    role: "university_admin",
    name: "TEAM University Admissions",
    email: "admissions@teamuni.uz",
    avatar: "TU",
    color: "from-violet-500 to-purple-600",
    university: "team-university",
    lastLogin: null
  }
];
