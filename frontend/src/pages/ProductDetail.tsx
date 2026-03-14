import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { fetchProductById } from '../api/shopService'
import type { Product } from '../types/shop'

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }
    fetchProductById(id).then((data) => setProduct(data))
  }, [id])

  if (!product) {
    return <p>Chargement du produit...</p>
  }

  return (
    <section>
      <Link to="/shop" className="link-inline">
        ← Retour boutique
      </Link>
      <Card title={product.name}>
        <p>{product.description || 'Pas de description.'}</p>
        <p>
          <strong>{product.price} Ar</strong>
        </p>
        <p>Stock: {product.stock?.quantity ?? 0}</p>
        <h4>Photos produit</h4>
        {product.images.length === 0 ? (
          <p>Aucune photo pour ce produit.</p>
        ) : (
          <div className="product-images-grid">
            {product.images.map((image) => (
              <img key={image.id} src={image.image} alt={product.name} className="product-image" />
            ))}
          </div>
        )}
      </Card>
    </section>
  )
}

export default ProductDetail
