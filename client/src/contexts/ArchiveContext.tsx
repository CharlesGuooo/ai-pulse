import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { trpc } from '@/lib/trpc';
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
  loading: boolean;
  saveTweet: (tweet: TweetData, influencer_name: string, influencer_handle: string) => void;
  removeTweet: (id: string) => void;
  isTweetSaved: (id: string) => boolean;
  saveProject: (project: AcademicProject) => void;
  removeProject: (id: string) => void;
  isProjectSaved: (id: string) => boolean;
}

const ArchiveContext = createContext<ArchiveContextType | null>(null);

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const { data: rawArchives, isLoading } = trpc.archive.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const addMutation = trpc.archive.add.useMutation({
    onSuccess: () => {
      utils.archive.list.invalidate();
    },
  });

  const removeMutation = trpc.archive.remove.useMutation({
    onSuccess: () => {
      utils.archive.list.invalidate();
    },
  });

  // Parse the raw DB records into typed archive state
  const archive: ArchiveState = {
    tweets: (rawArchives || [])
      .filter(a => a.itemType === 'tweet')
      .map(a => {
        const data = JSON.parse(a.itemData);
        const meta = a.metadata ? JSON.parse(a.metadata) : {};
        return { ...data, influencer_name: meta.name || '', influencer_handle: meta.handle || '' };
      }),
    projects: (rawArchives || [])
      .filter(a => a.itemType === 'academic')
      .map(a => JSON.parse(a.itemData)),
  };

  const saveTweet = useCallback((tweet: TweetData, influencer_name: string, influencer_handle: string) => {
    addMutation.mutate({
      itemType: 'tweet',
      itemId: tweet.id,
      itemData: JSON.stringify(tweet),
      metadata: JSON.stringify({ name: influencer_name, handle: influencer_handle }),
    });
  }, [addMutation]);

  const removeTweet = useCallback((id: string) => {
    removeMutation.mutate({ itemType: 'tweet', itemId: id });
  }, [removeMutation]);

  const isTweetSaved = useCallback((id: string) => {
    return (rawArchives || []).some(a => a.itemType === 'tweet' && a.itemId === id);
  }, [rawArchives]);

  const saveProject = useCallback((project: AcademicProject) => {
    addMutation.mutate({
      itemType: 'academic',
      itemId: project.id,
      itemData: JSON.stringify(project),
    });
  }, [addMutation]);

  const removeProject = useCallback((id: string) => {
    removeMutation.mutate({ itemType: 'academic', itemId: id });
  }, [removeMutation]);

  const isProjectSaved = useCallback((id: string) => {
    return (rawArchives || []).some(a => a.itemType === 'academic' && a.itemId === id);
  }, [rawArchives]);

  return (
    <ArchiveContext.Provider value={{ archive, loading: isLoading, saveTweet, removeTweet, isTweetSaved, saveProject, removeProject, isProjectSaved }}>
      {children}
    </ArchiveContext.Provider>
  );
}

export function useArchive() {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
}
