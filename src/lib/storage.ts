import { ServiceRecord } from '../types';
import { supabase } from './supabase';

const COLLECTION_NAME = 'service_records';

export const uploadFile = async (file: File | Blob, path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('media') // The user needs to create a 'media' bucket in Supabase storage
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error("Upload error", error);
    throw new Error('Falha ao enviar arquivo para o Supabase Storage.');
  }
};

export const subscribeRecords = (callback: (records: ServiceRecord[]) => void) => {
  let isSubscribed = true;

  const fetchInitial = async () => {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (isSubscribed && data) {
        const records = data.map(doc => ({
            ...doc,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt)
        })) as ServiceRecord[];
        callback(records);
    }
  };

  fetchInitial();

  const channel = supabase
    .channel('public:service_records')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: COLLECTION_NAME },
      () => {
        fetchInitial();
      }
    )
    .subscribe();

  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
};

export const saveRecord = async (record: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .insert({
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRecordById = async (id: string): Promise<ServiceRecord | null> => {
  try {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as ServiceRecord;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteRecordById = async (id: string) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateRecord = async (id: string, updates: Partial<Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
  try {
    const { error } = await supabase
      .from(COLLECTION_NAME)
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRelatedRecords = async (make: string, model: string, excludeId: string): Promise<ServiceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .eq('vehicleMake', make)
      .eq('vehicleModel', model)
      .neq('id', excludeId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    })) as ServiceRecord[];
  } catch (error) {
    console.error(error);
    return [];
  }
};
