export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  seller_id: string
  category: string | null
  name: string
  slug: string
  description: string
  price: string
  is_active: boolean
  stock?: {
    quantity: number
  }
}

export interface CartItem {
  id: string
  product: string
  product_name: string
  quantity: number
  unit_price: string
}

export interface Cart {
  id: string
  items: CartItem[]
}

export interface OrderItem {
  id: string
  product: string
  product_name: string
  quantity: number
  unit_price: string
}

export interface Order {
  id: string
  total_amount: string
  status: string
  shipping_address: string
  items: OrderItem[]
  created_at: string
}
