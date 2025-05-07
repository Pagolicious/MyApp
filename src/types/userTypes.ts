export interface Friend {
  uid: string;
  firstName: string;
  lastName: string;
  isOnline?: boolean;
}

export interface Skills {
  sport: string;
  skillLevel: number;
}

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  fcmToken: string;
  isPartyLeader: boolean;
  isPartyMember: boolean;
  isGroupLeader: boolean;
  isGroupMember: boolean;
  groupId: string;
  skills: Skills[];
  friends?: Friend[];
}

export interface AuthUser {
  uid: string
}
