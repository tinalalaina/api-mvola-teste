import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { addCartItem, fetchProducts } from '../api/shopService'
import type { Product } from '../types/shop'
import { useAuth } from '../hooks/useAuth'

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
        const next: Record<string, number> = {}
        data.forEach((product) => {
          next[product.id] = 1
        })
        setQuantities(next)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const canBuy = useMemo(() => isAuthenticated && role === 'CLIENT', [isAuthenticated, role])

  const setQuantity = (productId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, value) }))
  }

  const handleAddToCart = async (productId: string) => {
    const quantity = quantities[productId] ?? 1
    await addCartItem({ product: productId, quantity })
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
            <p>
              <strong>{product.price} Ar</strong>
            </p>
            <p>Stock: {product.stock?.quantity ?? 0}</p>
            <Link to={`/shop/${product.id}`} className="link-inline">
              Voir description et photos
            </Link>
            {canBuy ? (
              <>
                <div className="qty-box">
                  <button className="button" onClick={() => setQuantity(product.id, (quantities[product.id] ?? 1) - 1)}>
                    -
                  </button>
                  <span>{quantities[product.id] ?? 1}</span>
                  <button className="button" onClick={() => setQuantity(product.id, (quantities[product.id] ?? 1) + 1)}>
                    +
                  </button>
                </div>
                <button className="button button-primary" onClick={() => void handleAddToCart(product.id)}>
                  Ajouter au panier
                </button>
              </>
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
