export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          available_quantity_kg: number
          created_at: string | null
          crop: string
          farmer_id: string
          harvest_date: string
          id: string
          location: string
          metadata_json: Json | null
          parent_batch_id: string | null
          price_per_kg: number
          status: string
          total_quantity_kg: number
        }
        Insert: {
          available_quantity_kg: number
          created_at?: string | null
          crop: string
          farmer_id: string
          harvest_date: string
          id?: string
          location: string
          metadata_json?: Json | null
          parent_batch_id?: string | null
          price_per_kg: number
          status?: string
          total_quantity_kg: number
        }
        Update: {
          available_quantity_kg?: number
          created_at?: string | null
          crop?: string
          farmer_id?: string
          harvest_date?: string
          id?: string
          location?: string
          metadata_json?: Json | null
          parent_batch_id?: string | null
          price_per_kg?: number
          status?: string
          total_quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "batches_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_parent_batch_id_fkey"
            columns: ["parent_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      cart: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_display"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_relationships"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_orders: {
        Row: {
          consumer_id: string
          created_at: string
          delivery_address: string
          id: string
          inventory_id: string
          quantity: number
          retailer_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          consumer_id: string
          created_at?: string
          delivery_address: string
          id?: string
          inventory_id: string
          quantity: number
          retailer_id: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          consumer_id?: string
          created_at?: string
          delivery_address?: string
          id?: string
          inventory_id?: string
          quantity?: number
          retailer_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_orders_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumer_orders_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "retailer_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumer_orders_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          quantity_available: number
          retail_price_per_kg: number
          retailer_id: string
          source_batch_id: string
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          quantity_available: number
          retail_price_per_kg: number
          retailer_id: string
          source_batch_id: string
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          quantity_available?: number
          retail_price_per_kg?: number
          retailer_id?: string
          source_batch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_source_batch_id_fkey"
            columns: ["source_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          id: string
          maker_id: string
          price_offered: number
          qty_offered: number
          status: string
          target_batch_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          maker_id: string
          price_offered: number
          qty_offered: number
          status?: string
          target_batch_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          maker_id?: string
          price_offered?: number
          qty_offered?: number
          status?: string
          target_batch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_maker_id_fkey"
            columns: ["maker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_target_batch_id_fkey"
            columns: ["target_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          batch_id: string
          id: string
          inventory_id: string
          order_id: string
          price_per_kg: number
          quantity: number
        }
        Insert: {
          batch_id: string
          id?: string
          inventory_id: string
          order_id: string
          price_per_kg: number
          quantity: number
        }
        Update: {
          batch_id?: string
          id?: string
          inventory_id?: string
          order_id?: string
          price_per_kg?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_json: Json
          consumer_id: string
          created_at: string | null
          id: string
          retailer_id: string
          status: string
          total_amount: number
        }
        Insert: {
          address_json?: Json
          consumer_id: string
          created_at?: string | null
          id?: string
          retailer_id: string
          status?: string
          total_amount: number
        }
        Update: {
          address_json?: Json
          consumer_id?: string
          created_at?: string | null
          id?: string
          retailer_id?: string
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_inventory: {
        Row: {
          batch_id: string
          created_at: string
          expiry_date: string | null
          id: string
          quantity: number
          retail_price_per_kg: number
          retailer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          quantity: number
          retail_price_per_kg: number
          retailer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          quantity?: number
          retail_price_per_kg?: number
          retailer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_inventory_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          from_user_id: string
          id: string
          rating: number
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          from_user_id: string
          id?: string
          rating: number
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          from_user_id?: string
          id?: string
          rating?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_arrival: string | null
          created_at: string
          departure_time: string | null
          distributor_id: string
          driver_name: string | null
          driver_phone: string | null
          expected_arrival: string | null
          id: string
          status: string
          tracking_notes: string | null
          transfer_id: string
          updated_at: string
          vehicle_number: string | null
        }
        Insert: {
          actual_arrival?: string | null
          created_at?: string
          departure_time?: string | null
          distributor_id: string
          driver_name?: string | null
          driver_phone?: string | null
          expected_arrival?: string | null
          id?: string
          status?: string
          tracking_notes?: string | null
          transfer_id: string
          updated_at?: string
          vehicle_number?: string | null
        }
        Update: {
          actual_arrival?: string | null
          created_at?: string
          departure_time?: string | null
          distributor_id?: string
          driver_name?: string | null
          driver_phone?: string | null
          expected_arrival?: string | null
          id?: string
          status?: string
          tracking_notes?: string | null
          transfer_id?: string
          updated_at?: string
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_changes: {
        Row: {
          change_amount: number
          change_type: string
          created_at: string | null
          id: string
          new_stock: number
          old_stock: number
          order_id: string | null
          product_id: string
        }
        Insert: {
          change_amount: number
          change_type: string
          created_at?: string | null
          id?: string
          new_stock: number
          old_stock: number
          order_id?: string | null
          product_id: string
        }
        Update: {
          change_amount?: number
          change_type?: string
          created_at?: string | null
          id?: string
          new_stock?: number
          old_stock?: number
          order_id?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_display"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_relationships"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_profile_updates: {
        Row: {
          created_at: string | null
          id: string
          new_business_name: string | null
          old_business_name: string | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_business_name?: string | null
          old_business_name?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_business_name?: string | null
          old_business_name?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_profile_updates_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          batch_id: string
          created_at: string | null
          from_user_id: string
          id: string
          notes: string | null
          quantity_kg: number
          status: string
          to_user_id: string
          transfer_type: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          from_user_id: string
          id?: string
          notes?: string | null
          quantity_kg: number
          status?: string
          to_user_id: string
          transfer_type: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          notes?: string | null
          quantity_kg?: number
          status?: string
          to_user_id?: string
          transfer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          business_name: string | null
          certifications: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          fleet_size: number | null
          gst_number: string | null
          id: string
          latitude: number | null
          license_number: string | null
          longitude: number | null
          name: string
          phone: string | null
          pincode: string | null
          profile_json: Json | null
          role: string
          state: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          certifications?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fleet_size?: number | null
          gst_number?: string | null
          id?: string
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          pincode?: string | null
          profile_json?: Json | null
          role: string
          state?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          certifications?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fleet_size?: number | null
          gst_number?: string | null
          id?: string
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          pincode?: string | null
          profile_json?: Json | null
          role?: string
          state?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      cart_items_with_details: {
        Row: {
          cart_id: string | null
          created_at: string | null
          item_total: number | null
          product_category: string | null
          product_id: string | null
          product_image: string | null
          product_name: string | null
          product_price: number | null
          product_stock: number | null
          quantity: number | null
          supplier_business_name: string | null
          supplier_city: string | null
          supplier_name: string | null
          supplier_phone: string | null
          supplier_state: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_display"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_supplier_relationships"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_supplier_display: {
        Row: {
          product_category: string | null
          product_created_at: string | null
          product_id: string | null
          product_image: string | null
          product_name: string | null
          product_price: number | null
          product_stock: number | null
          supplier_address: string | null
          supplier_business_name: string | null
          supplier_city: string | null
          supplier_created_at: string | null
          supplier_display_location: string | null
          supplier_display_name: string | null
          supplier_display_phone: string | null
          supplier_email: string | null
          supplier_id: string | null
          supplier_name: string | null
          supplier_phone: string | null
          supplier_pincode: string | null
          supplier_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_supplier_relationships: {
        Row: {
          product_id: string | null
          product_name: string | null
          supplier_business_name: string | null
          supplier_city: string | null
          supplier_email: string | null
          supplier_id: string | null
          supplier_name: string | null
          supplier_phone: string | null
          supplier_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_to_cart_safe: {
        Args: { p_product_id: string; p_quantity?: number; p_vendor_id: string }
        Returns: string
      }
      add_to_cart_safe_v2: {
        Args: { p_product_id: string; p_quantity?: number; p_vendor_id: string }
        Returns: string
      }
      buy_batch: {
        Args: {
          p_batch_id: string
          p_buyer_id: string
          p_price_offered: number
          p_quantity: number
        }
        Returns: Json
      }
      create_order: {
        Args: {
          p_address: Json
          p_consumer_id: string
          p_items: Json
          p_retailer_id: string
        }
        Returns: Json
      }
      delete_product_safe: {
        Args: { product_id: string; supplier_id: string }
        Returns: boolean
      }
      get_cart_total: {
        Args: { p_vendor_id: string }
        Returns: number
      }
      get_latest_supplier_account: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_name: string
          created_at: string
          email: string
          id: string
          name: string
        }[]
      }
      get_most_recent_valid_vendor: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_supplier_display_info: {
        Args: { supplier_id: string }
        Returns: {
          address: string
          business_name: string
          city: string
          display_location: string
          display_name: string
          display_phone: string
          email: string
          id: string
          name: string
          phone: string
          pincode: string
          state: string
        }[]
      }
      get_supplier_orders: {
        Args: { supplier_uuid: string }
        Returns: {
          created_at: string
          id: string
          product_id: string
          product_name: string
          quantity: number
          status: string
          supplier_id: string
          supplier_name: string
          total_amount: number
          updated_at: string
          vendor_id: string
          vendor_name: string
        }[]
      }
      get_vendor_display_info: {
        Args: { input_vendor_id: string }
        Returns: {
          vendor_address: string
          vendor_business_name: string
          vendor_city: string
          vendor_display_location: string
          vendor_display_name: string
          vendor_display_phone: string
          vendor_email: string
          vendor_id: string
          vendor_name: string
          vendor_phone: string
          vendor_pincode: string
          vendor_state: string
        }[]
      }
      get_vendor_orders: {
        Args: { vendor_uuid: string }
        Returns: {
          created_at: string
          id: string
          product_id: string
          product_name: string
          quantity: number
          status: string
          supplier_id: string
          supplier_name: string
          total_amount: number
          updated_at: string
          vendor_id: string
          vendor_name: string
        }[]
      }
      reduce_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      restore_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      sell_to_retailer: {
        Args: {
          p_batch_id: string
          p_price_per_kg: number
          p_quantity: number
          p_retailer_id: string
          p_seller_id: string
        }
        Returns: Json
      }
      update_cart_quantity_safe: {
        Args: { p_cart_item_id: string; p_quantity: number }
        Returns: boolean
      }
      update_cart_quantity_safe_v2: {
        Args: { p_cart_item_id: string; p_quantity: number }
        Returns: boolean
      }
      update_products_to_latest_supplier: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      validate_vendor_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_valid: boolean
          vendor_business_name: string
          vendor_email: string
          vendor_id: string
          vendor_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
