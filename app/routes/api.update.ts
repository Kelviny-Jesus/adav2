import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
/* import { exec } from 'child_process';
import { promisify } from 'util'; */

/* const execAsync = promisify(exec); */

interface UpdateRequestBody {
  branch: string;
  autoUpdate?: boolean;
}

interface UpdateProgress {
  stage: 'fetch' | 'pull' | 'install' | 'build' | 'complete';
  message: string;
  progress?: number;
  error?: string;
  details?: {
    changedFiles?: string[];
    additions?: number;
    deletions?: number;
    commitMessages?: string[];
    totalSize?: string;
    currentCommit?: string;
    remoteCommit?: string;
    updateReady?: boolean;
    changelog?: string;
    compareUrl?: string;
  };
}

export const action: ActionFunction = async () => {
  return json({ error: 'Not available in this environment.' }, { status: 501 });
};

/*
// Add this function to fetch the changelog
async function fetchChangelog(currentCommit: string, remoteCommit: string): Promise<string> {
  // Disabled in Worker environment
  return 'Not available in this environment.';
}
*/
