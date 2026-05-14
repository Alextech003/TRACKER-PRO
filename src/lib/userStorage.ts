import { supabase } from './supabase';

const COLLECTION_NAME = 'users';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: 'admin' | 'tecnico' | 'tecnico_criador';
  lastAccess?: Date;
  createdAt?: Date;
}

export const subscribeUsers = (callback: (users: UserProfile[]) => void) => {
  let isSubscribed = true;

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (isSubscribed && data) {
      const users = data.map(doc => ({
        ...doc,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
        lastAccess: doc.lastAccess ? new Date(doc.lastAccess) : undefined
      })) as UserProfile[];
      callback(users);
    }
  };

  fetchUsers();

  const channel = supabase
    .channel('public:users')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: COLLECTION_NAME },
      () => {
        fetchUsers();
      }
    )
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
};

export const saveUserProfile = async (user: Omit<UserProfile, 'createdAt' | 'lastAccess'>) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .upsert({
        ...user,
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString()
      }, { onConflict: 'uid' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving profile', error);
  }
};

export const updateUserLastAccess = async (uid: string) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .update({
        lastAccess: new Date().toISOString()
      })
      .eq('uid', uid);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating last access', error);
  }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'tecnico' | 'tecnico_criador') => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .update({ role })
      .eq('uid', uid);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating role', error);
  }
};

export const deleteUserById = async (uid: string) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .delete()
      .eq('uid', uid);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user', error);
  }
};
