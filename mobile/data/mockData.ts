// Mock data for the StudyRats application

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  subject: string;
  duration: string;
  timestamp: Date;
  note?: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  checkInCount: number;
  rank: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  description?: string;
  ownerId: string;
  challengeDurationDays: number;
  challengeEndsAt: string;
  topMembers: GroupMember[];
  allMembers: GroupMember[];
}

export const currentUser: User = {
  id: "user-1",
  name: "Alex Chen",
  username: "alexc",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
};

export const recentActivity: CheckIn[] = [
  {
    id: "checkin-1",
    userId: "user-2",
    userName: "Sarah Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    subject: "Cálculo I",
    duration: "2h",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    note: "Finalizei os exercícios do capítulo 5!",
  },
  {
    id: "checkin-2",
    userId: "user-3",
    userName: "Marcus Lee",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    subject: "Química Orgânica",
    duration: "3h",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "checkin-3",
    userId: "user-4",
    userName: "Emily Rodriguez",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    subject: "Estruturas de Dados",
    duration: "1.5h",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    note: "Árvores binárias estão fazendo sentido agora!",
  },
  {
    id: "checkin-4",
    userId: "user-5",
    userName: "David Kim",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    subject: "Física II",
    duration: "2.5h",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

export const studyGroups: StudyGroup[] = [
  {
    id: "group-1",
    name: "CS Grinders 💻",
    code: "CS2024",
    memberCount: 12,
    description: "Grupo focado em algoritmos, estrutura de dados e projetos práticos.",
    ownerId: "user-1",
    challengeDurationDays: 7,
    challengeEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    topMembers: [
      {
        userId: "user-2",
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        checkInCount: 47,
        rank: 1,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 42,
        rank: 2,
      },
      {
        userId: "user-3",
        name: "Marcus Lee",
        username: "marcusl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        checkInCount: 38,
        rank: 3,
      },
    ],
    allMembers: [
      {
        userId: "user-2",
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        checkInCount: 47,
        rank: 1,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 42,
        rank: 2,
      },
      {
        userId: "user-3",
        name: "Marcus Lee",
        username: "marcusl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        checkInCount: 38,
        rank: 3,
      },
      {
        userId: "user-4",
        name: "Emily Rodriguez",
        username: "emilyr",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        checkInCount: 35,
        rank: 4,
      },
      {
        userId: "user-5",
        name: "David Kim",
        username: "davidk",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        checkInCount: 31,
        rank: 5,
      },
      {
        userId: "user-6",
        name: "Jessica Taylor",
        username: "jessicat",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        checkInCount: 28,
        rank: 6,
      },
      {
        userId: "user-7",
        name: "Michael Brown",
        username: "michaelb",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        checkInCount: 25,
        rank: 7,
      },
      {
        userId: "user-8",
        name: "Lisa Wang",
        username: "lisaw",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        checkInCount: 22,
        rank: 8,
      },
      {
        userId: "user-9",
        name: "Chris Martinez",
        username: "chrism",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
        checkInCount: 19,
        rank: 9,
      },
      {
        userId: "user-10",
        name: "Amanda Foster",
        username: "amandaf",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
        checkInCount: 16,
        rank: 10,
      },
      {
        userId: "user-11",
        name: "Ryan Cooper",
        username: "ryanc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
        checkInCount: 13,
        rank: 11,
      },
      {
        userId: "user-12",
        name: "Nicole Harris",
        username: "nicoleh",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nicole",
        checkInCount: 10,
        rank: 12,
      },
    ],
  },
  {
    id: "group-2",
    name: "Med School Warriors 🩺",
    code: "MED2024",
    memberCount: 8,
    description: "Revisões diárias, simulados e apoio para manter a rotina.",
    ownerId: "user-4",
    challengeDurationDays: 14,
    challengeEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    topMembers: [
      {
        userId: "user-3",
        name: "Marcus Lee",
        username: "marcusl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        checkInCount: 52,
        rank: 1,
      },
      {
        userId: "user-4",
        name: "Emily Rodriguez",
        username: "emilyr",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        checkInCount: 48,
        rank: 2,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 41,
        rank: 3,
      },
    ],
    allMembers: [
      {
        userId: "user-3",
        name: "Marcus Lee",
        username: "marcusl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        checkInCount: 52,
        rank: 1,
      },
      {
        userId: "user-4",
        name: "Emily Rodriguez",
        username: "emilyr",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        checkInCount: 48,
        rank: 2,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 41,
        rank: 3,
      },
      {
        userId: "user-5",
        name: "David Kim",
        username: "davidk",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        checkInCount: 39,
        rank: 4,
      },
      {
        userId: "user-6",
        name: "Jessica Taylor",
        username: "jessicat",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        checkInCount: 36,
        rank: 5,
      },
      {
        userId: "user-7",
        name: "Michael Brown",
        username: "michaelb",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        checkInCount: 33,
        rank: 6,
      },
      {
        userId: "user-8",
        name: "Lisa Wang",
        username: "lisaw",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        checkInCount: 28,
        rank: 7,
      },
      {
        userId: "user-9",
        name: "Chris Martinez",
        username: "chrism",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
        checkInCount: 24,
        rank: 8,
      },
    ],
  },
  {
    id: "group-3",
    name: "Engineering Squad ⚙️",
    code: "ENG2024",
    memberCount: 10,
    description: "Squad de estudos para sistemas, arquitetura e entregas.",
    ownerId: "user-6",
    challengeDurationDays: 10,
    challengeEndsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    topMembers: [
      {
        userId: "user-5",
        name: "David Kim",
        username: "davidk",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        checkInCount: 44,
        rank: 1,
      },
      {
        userId: "user-6",
        name: "Jessica Taylor",
        username: "jessicat",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        checkInCount: 40,
        rank: 2,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 37,
        rank: 3,
      },
    ],
    allMembers: [
      {
        userId: "user-5",
        name: "David Kim",
        username: "davidk",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        checkInCount: 44,
        rank: 1,
      },
      {
        userId: "user-6",
        name: "Jessica Taylor",
        username: "jessicat",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        checkInCount: 40,
        rank: 2,
      },
      {
        userId: "user-1",
        name: "Alex Chen",
        username: "alexc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        checkInCount: 37,
        rank: 3,
      },
      {
        userId: "user-7",
        name: "Michael Brown",
        username: "michaelb",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        checkInCount: 34,
        rank: 4,
      },
      {
        userId: "user-8",
        name: "Lisa Wang",
        username: "lisaw",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        checkInCount: 30,
        rank: 5,
      },
      {
        userId: "user-9",
        name: "Chris Martinez",
        username: "chrism",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
        checkInCount: 27,
        rank: 6,
      },
      {
        userId: "user-10",
        name: "Amanda Foster",
        username: "amandaf",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
        checkInCount: 24,
        rank: 7,
      },
      {
        userId: "user-11",
        name: "Ryan Cooper",
        username: "ryanc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
        checkInCount: 20,
        rank: 8,
      },
      {
        userId: "user-12",
        name: "Nicole Harris",
        username: "nicoleh",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nicole",
        checkInCount: 17,
        rank: 9,
      },
      {
        userId: "user-2",
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        checkInCount: 14,
        rank: 10,
      },
    ],
  },
];

export const currentStreak = 7;
