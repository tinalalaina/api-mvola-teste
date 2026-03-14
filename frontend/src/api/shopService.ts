import api from './api'
import type { Cart, Category, Order, Product } from '../types/shop'

export interface CreateProductPayload {
  category: string | null
  name: string
  slug: string
  description: string
  price: string
  is_active: boolean
  stock_quantity?: number
}

export const fetchCategories = async () => {
  const { data } = await api.get<Category[]>('/catalog/categories/')
  return data
}

export const createCategory = async (payload: { name: string; slug: string }) => {
  const { data } = await api.post<Category>('/catalog/categories/', payload)
  return data
}

export const fetchProducts = async () => {
  const { data } = await api.get<Product[]>('/catalog/products/?active=true')
  return data
}

export const fetchProductById = async (productId: string) => {
  const { data } = await api.get<Product>(`/catalog/products/${productId}/`)
  return data
}

export const fetchSellerProducts = async (sellerId: string) => {
  const { data } = await api.get<Product[]>(`/catalog/products/?seller=${sellerId}`)
  return data
}

export const createProduct = async (payload: CreateProductPayload) => {
  const { data } = await api.post<Product>('/catalog/products/', payload)
  return data
}

export const uploadProductImages = async (productId: string, files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const { data } = await api.post(`/catalog/products/${productId}/images/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const updateProduct = async (productId: string, payload: Partial<CreateProductPayload>) => {
  const { data } = await api.patch<Product>(`/catalog/products/${productId}/`, payload)
  return data
}

export const fetchCart = async () => {
  const { data } = await api.get<Cart>('/cart/')
  return data
}

export const addCartItem = async (payload: { product: string; quantity: number }) => {
  const { data } = await api.post('/cart/items/', payload)
  return data
}

export const updateCartItem = async (itemId: string, payload: { quantity: number; product?: string }) => {
  const { data } = await api.patch(`/cart/items/${itemId}/`, payload)
  return data
}

export const removeCartItem = async (itemId: string) => {
  await api.delete(`/cart/items/${itemId}/`)
}

export const checkout = async (shipping_address: string) => {
  const { data } = await api.post<Order>('/orders/checkout/', { shipping_address })
  return data
}

export const fetchOrders = async () => {
  const { data } = await api.get<Order[]>('/orders/')
  return data
}
