
import React from 'react';

const supabaseInstance = null; 
const connected = false;

export const supabase = supabaseInstance;

export const getSupabaseClient = () => {
  console.warn("Supabase integration is not complete or intentionally disconnected. getSupabaseClient() returning null.");
  return null; 
};

export const isSupabaseConnected = () => {
  return false; 
};
