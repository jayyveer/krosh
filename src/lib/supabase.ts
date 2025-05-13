import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          address_line: string
          city: string
          state: string
          pincode: string
          country: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          address_line: string
          city: string
          state: string
          pincode: string
          country: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          address_line?: string
          city?: string
          state?: string
          pincode?: string
          country?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string
          image_urls: string[]
          price: number
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category_id: string
          image_urls?: string[]
          price: number
          is_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string
          image_urls?: string[]
          price?: number
          is_visible?: boolean
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          color: string
          weight: string
          size: string
          stock: number
          is_sold_out: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          color: string
          weight: string
          size: string
          stock?: number
          is_sold_out?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          color?: string
          weight?: string
          size?: string
          stock?: number
          is_sold_out?: boolean
          created_at?: string
        }
      }
    }
    Enums: {
      order_status: 'requested' | 'approved' | 'shipped'
      payment_method: 'stripe' | 'cod'
      payment_status: 'pending' | 'paid' | 'failed'
      inventory_action: 'restock' | 'sale' | 'correction'
      admin_role: 'superadmin' | 'editor'
    }
  }
}