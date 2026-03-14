import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { addCartItem, fetchProducts } from '../api/shopService'
import type { Product } from '../types/shop'
import { useAuth } from '../hooks/useAuth'

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const canBuy = useMemo(() => isAuthenticated && role === 'CLIENT', [isAuthenticated, role])

  const handleAddToCart = async (productId: string) => {
    await addCartItem({ product: productId, quantity: 1 })
    setMessage('Produit ajouté au panier ✅')
    setTimeout(() => setMessage(null), 2500)
  }

  if (loading) {
    return <p>Chargement du catalogue...</p>
  }

  return (
    <section>
      <h2>Boutique</h2>
      <p>Explorez les produits disponibles.</p>
      {message ? <p className="success-message">{message}</p> : null}
      <div className="info-grid">
        {products.map((product) => (
          <Card key={product.id} title={product.name}>
            <p>{product.description || 'Sans description.'}</p>
            <p>
              <strong>{product.price} Ar</strong>
            </p>
            <p>Stock: {product.stock?.quantity ?? 0}</p>
            {canBuy ? (
              <button className="button button-primary" onClick={() => void handleAddToCart(product.id)}>
                Ajouter au panier
              </button>
            ) : (
              <small>Connectez-vous en tant que client pour acheter.</small>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}

export default Shop
