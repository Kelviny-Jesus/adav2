import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { supabaseConnection } from '~/lib/stores/supabase';
import { classNames } from '~/utils/classNames';

export function SupabaseAlert() {
  const connection = useStore(supabaseConnection);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Show alert if we have a selected project but no credentials
    setShowAlert(!!connection.selectedProjectId && !connection.credentials);
  }, [connection.selectedProjectId, connection.credentials]);

  if (!showAlert) {
    return null;
  }

  const handleOpenConnectionDialog = () => {
    const event = new CustomEvent('open-supabase-connection');
    document.dispatchEvent(event);
  };

  return (
    <div
      className={classNames(
        'flex items-center gap-3 p-3 mb-4 rounded-lg border',
        'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
      )}
    >
      <div className="i-ph:warning-circle text-amber-500 dark:text-amber-400 w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Supabase Connection Issue</h4>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
          Your Supabase project is selected, but API credentials are missing. Please reconnect to fetch the API keys.
        </p>
      </div>
      <button
        onClick={handleOpenConnectionDialog}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
      >
        Reconnect
      </button>
    </div>
  );
}
