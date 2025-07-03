export type GroupUpdate = Partial<Omit<Group, 'id' | 'members' | 'createdBy' | 'memberUids'>>;


export interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel?: string | number;
  role?: string;
}

export type Applicant = {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel?: string | number;
  note?: string;
  appliedAt?: string,
  role?: "leader" | "member";
  members?: Omit<Applicant, "members" | "role">[];
};

export interface Group {
  id: string;
  activity: string;
  title?: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  toDate: string;
  skillLevel?: number | null;
  createdBy: CreatedBy;
  memberLimit: number;
  details: string;
  isDelisted: boolean;
  gender: string,
  visibility: string,
  minAge: number,
  maxAge: number,
  isIgnoreSkillLevel?: boolean;
  isFriendsOnly: boolean,
  isAutoAccept: boolean,
  isVerifiedOnly: boolean,
  members: Member[];
  memberUids: string[];
  applicants: Applicant[];
}

export interface SearchParty {
  leaderUid: string;
  leaderFirstName: string;
  leaderLastName: string;
  members: Member[];
}

export interface CreatedBy {
  uid: string;
  firstName: string;
  lastName: string;
}
