import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AcademicProject, TweetData } from '@/hooks/useData';

interface ArchivedTweet extends TweetData {
  influencer_name: string;
  influencer_handle: string;
}

interface ArchiveState {
  tweets: ArchivedTweet[];
  projects: AcademicProject[];
}

interface ArchiveContextType {
  archive: ArchiveState;
  saveTweet: (tweet: TweetData, influencer_name: string, influencer_handle: string) => void;
  removeTweet: (id: string) => void;
  isTweetSaved: (id: string) => boolean;
  saveProject: (project: AcademicProject) => void;
  removeProject: (id: string) => void;
  isProjectSaved: (id: string) => boolean;
}

const ArchiveContext = createContext<ArchiveContextType | null>(null);

const STORAGE_KEY = 'ai-pulse-archive';

function loadArchive(): ArchiveState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { tweets: [], projects: [] };
}

function saveArchive(state: ArchiveState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [archive, setArchive] = useState<ArchiveState>(loadArchive);

  useEffect(() => {
    saveArchive(archive);
  }, [archive]);

  const saveTweet = (tweet: TweetData, influencer_name: string, influencer_handle: string) => {
    setArchive(prev => ({
      ...prev,
      tweets: [{ ...tweet, influencer_name, influencer_handle }, ...prev.tweets.filter(t => t.id !== tweet.id)]
    }));
  };

  const removeTweet = (id: string) => {
    setArchive(prev => ({
      ...prev,
      tweets: prev.tweets.filter(t => t.id !== id)
    }));
  };

  const isTweetSaved = (id: string) => archive.tweets.some(t => t.id === id);

  const saveProject = (project: AcademicProject) => {
    setArchive(prev => ({
      ...prev,
      projects: [project, ...prev.projects.filter(p => p.id !== project.id)]
    }));
  };

  const removeProject = (id: string) => {
    setArchive(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const isProjectSaved = (id: string) => archive.projects.some(p => p.id === id);

  return (
    <ArchiveContext.Provider value={{ archive, saveTweet, removeTweet, isTweetSaved, saveProject, removeProject, isProjectSaved }}>
      {children}
    </ArchiveContext.Provider>
  );
}

export function useArchive() {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
}
