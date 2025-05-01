export interface Friend {
  uid: string;
  firstName: string;
  lastName: string;
}

export interface Skills {
  sport: string;
  skillLevel: number;
}

export interface User {
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
