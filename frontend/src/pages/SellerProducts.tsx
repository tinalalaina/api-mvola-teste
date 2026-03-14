import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Card from '../components/Card'
import {
  createCategory,
  createProduct,
  fetchCategories,
  fetchSellerProducts,
  updateProduct,
  uploadProductImages,
} from '../api/shopService'
import { useAuth } from '../hooks/useAuth'
import type { Category, Product } from '../types/shop'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

const SellerProducts = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState(0)
  const [categoryId, setCategoryId] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [photos, setPhotos] = useState<FileList | null>(null)

  const loadData = async () => {
    const [cats, prods] = await Promise.all([
      fetchCategories(),
      user ? fetchSellerProducts(user.id) : Promise.resolve([]),
    ])
    setCategories(cats)
    setProducts(prods)
  }

  useEffect(() => {
    Promise.all([fetchCategories(), user ? fetchSellerProducts(user.id) : Promise.resolve([])]).then(([cats, prods]) => {
      setCategories(cats)
      setProducts(prods)
    })
  }, [user])

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault()
    await createCategory({ name: newCategoryName, slug: slugify(newCategoryName) })
    setNewCategoryName('')
    await loadData()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const product = await createProduct({
      category: categoryId || null,
      name,
      slug: slugify(name),
      description,
      price,
      is_active: true,
      stock_quantity: stockQuantity,
    })

    if (photos && photos.length > 0) {
      await uploadProductImages(product.id, Array.from(photos).slice(0, 5))
    }

    setName('')
    setDescription('')
    setPrice('')
    setStockQuantity(0)
    setCategoryId('')
    setPhotos(null)
    await loadData()
  }

  const changeStock = async (product: Product, nextQuantity: number) => {
    await updateProduct(product.id, { stock_quantity: Math.max(0, nextQuantity) })
    await loadData()
  }

  return (
    <section className="page-grid">
      <Card title="Créer une catégorie">
        <form className="form-grid" onSubmit={handleCreateCategory}>
          <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nom" required />
          <button className="button">Ajouter catégorie</button>
        </form>
      </Card>

      <Card title="Ajouter un produit (stock + jusqu'à 5 photos)">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du produit" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Prix (ex: 2500.00)" required />
          <input
            type="number"
            min={0}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            placeholder="Stock"
            required
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sans catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} />
          <small>Maximum 5 photos par produit.</small>
          <button className="button button-primary">Créer produit</button>
        </form>
      </Card>

      <Card title="Mes produits (contrôle de stock)">
        {products.length === 0 ? (
          <p>Aucun produit pour le moment.</p>
        ) : (
          <ul className="cart-list">
            {products.map((product) => (
              <li key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.price} Ar</p>
                  <p>Photos: {product.images.length}/5</p>
                </div>
                <div className="qty-box">
                  <button className="button" onClick={() => void changeStock(product, (product.stock?.quantity ?? 0) - 1)}>
                    -
                  </button>
                  <span>Stock: {product.stock?.quantity ?? 0}</span>
                  <button className="button" onClick={() => void changeStock(product, (product.stock?.quantity ?? 0) + 1)}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}

export default SellerProducts
