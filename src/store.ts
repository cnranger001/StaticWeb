import { create } from 'zustand';

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  vote_count: number;
}

interface State {
  candidates: Candidate[];
  voteStatus: boolean;
  activeKey: string;
  setCandidates: (c: Candidate[]) => void;
  setVoteStatus: (status: boolean) => void;
  setActiveKey: (key: string) => void;
}

export const useCandidateStore = create<State>((set) => ({
  candidates: [],
  voteStatus: false,
  activeKey: '',
  setCandidates: (candidates) => set({ candidates }),
  setVoteStatus: (voteStatus) => set({ voteStatus }),
  setActiveKey: (activeKey) => set({ activeKey }),
}));
