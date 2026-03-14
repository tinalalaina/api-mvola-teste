import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { checkout, fetchCart, removeCartItem } from '../api/shopService'
import type { Cart } from '../types/shop'

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadCart = async () => {
    const data = await fetchCart()
    setCart(data)
  }

  useEffect(() => {
    fetchCart().then((data) => setCart(data))
  }, [])

  const total = useMemo(() => {
    if (!cart) {
      return 0
    }

    return cart.items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0)
  }, [cart])

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId)
    await loadCart()
  }

  const handleCheckout = async () => {
    if (!cart?.items.length) {
      return
    }
    const order = await checkout(shippingAddress)
    setFeedback(`Commande ${order.id} créée (${order.total_amount} Ar).`)
    await loadCart()
  }

  return (
    <section className="page-grid">
      <Card title="Mon panier">
        {!cart?.items.length ? (
          <p>Votre panier est vide.</p>
        ) : (
          <ul className="cart-list">
            {cart.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.product_name}</strong>
                  <p>
                    {item.quantity} x {item.unit_price} Ar
                  </p>
                </div>
                <button className="button" onClick={() => void handleRemove(item.id)}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Checkout">
        <label className="form-field">
          Adresse de livraison
          <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={4} />
        </label>
        <p>
          Total: <strong>{total.toFixed(2)} Ar</strong>
        </p>
        <button className="button button-primary" onClick={() => void handleCheckout()}>
          Valider la commande
        </button>
        {feedback ? <p className="success-message">{feedback}</p> : null}
      </Card>
    </section>
  )
}

export default CartPage
