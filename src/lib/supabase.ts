import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey);
} else {
  console.warn('Supabase environment variables not found. Please check your .env file.');
}

export function getSupabase(): SupabaseClient | null {
  return client;
}

export { client as supabase };

// Database types
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  price_type: 'month' | 'night';
  rating: number;
  reviews: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: 'rental' | 'airbnb' | 'office';
  featured: boolean;
  managed_by?: 'landlord' | 'agency';
  landlord_name?: string;
  landlord_verified?: boolean;
  agency_name?: string;
  agency_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  location: string;
  image: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface MovingService {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  services: string[];
  price_range: string;
  verified: boolean;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: 'tenant' | 'landlord' | 'agent' | 'mover' | 'buyer' | 'seller';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface MovingBooking {
  id: string;
  user_id: string;
  service_id: string;
  booking_date: string;
  from_address: string;
  to_address: string;
  estimated_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  property_id?: string;
  marketplace_item_id?: string;
  moving_service_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface PropertyOwner {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_type: 'owner' | 'agent';
  commission_rate?: number;
  created_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

// Authentication functions
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// User profile functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Database operations (existing functions)
export async function getProperties(type?: 'rental' | 'airbnb' | 'office', featured?: boolean) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase client not initialized. Please check your environment variables.');
    return [];
  }

  let query = supabase.from('properties').select('*');
  
  if (type) {
    query = query.eq('type', type);
  }
  
  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  
  return data as Property[];
}

export async function getMarketplaceItems() {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase client not initialized. Please check your environment variables.');
    return [];
  }

  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching marketplace items:', error);
    return [];
  }
  
  return data as MarketplaceItem[];
}

export async function getMovingServices() {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase client not initialized. Please check your environment variables.');
    return [];
  }

  const { data, error } = await supabase
    .from('moving_services')
    .select('*')
    .order('rating', { ascending: false });
  
  if (error) {
    console.error('Error fetching moving services:', error);
    return [];
  }
  
  return data as MovingService[];
}

// Booking functions
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMovingBooking(booking: Omit<MovingBooking, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('moving_bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserMovingBookings(userId: string): Promise<MovingBooking[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('moving_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Review functions
export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPropertyReviews(propertyId: string): Promise<Review[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMovingServiceReviews(serviceId: string): Promise<Review[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('moving_service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Messaging functions
export async function createConversation(participant1Id: string, participant2Id: string): Promise<Conversation> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant1_id: participant1Id,
      participant2_id: participant2Id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function sendMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Property management functions
export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) throw error;
}

export async function getUserProperties(userId: string): Promise<Property[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('managed_by', 'landlord')
    .eq('landlord_name', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Search and filtering functions
export async function searchProperties(query: string, filters?: {
  type?: 'rental' | 'airbnb' | 'office';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
}): Promise<Property[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  let supabaseQuery = supabase
    .from('properties')
    .select('*')
    .or(`title.ilike.%${query}%,location.ilike.%${query}%`);

  if (filters?.type) {
    supabaseQuery = supabaseQuery.eq('type', filters.type);
  }
  if (filters?.minPrice) {
    supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
  }
  if (filters?.location) {
    supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
  }
  if (filters?.bedrooms) {
    supabaseQuery = supabaseQuery.gte('bedrooms', filters.bedrooms);
  }

  const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
