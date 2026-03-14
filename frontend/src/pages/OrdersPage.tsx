import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { fetchOrders } from '../api/shopService'
import type { Order } from '../types/shop'

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await fetchOrders()
      setOrders(data)
    }

    void load()
  }, [])

  return (
    <section>
      <h2>Mes commandes</h2>
      <div className="info-grid">
        {orders.map((order) => (
          <Card key={order.id} title={`Commande ${order.id.slice(0, 8)}`}>
            <p>Statut: {order.status}</p>
            <p>Total: {order.total_amount} Ar</p>
            <p>Articles: {order.items.length}</p>
          </Card>
        ))}
      </div>
      {orders.length === 0 ? <p>Aucune commande pour le moment.</p> : null}
    </section>
  )
}

export default OrdersPage
