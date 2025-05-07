export interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel?: string | number;
  role?: string; // For InvitationContext
}

export type Applicant = {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel?: string | number;
  note?: string;
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
  skillvalue?: number;
  createdBy: string;
  memberLimit: number;
  details: string;
  isDelisted: boolean;
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
