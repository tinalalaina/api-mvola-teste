import { Link } from 'react-router-dom'
import Card from '../components/Card'

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div>
          <p className="eyebrow">Plateforme de vente agricole multi-utilisateurs</p>
          <h1>Votre boutique est prête: catalogue, panier, commande, espace vendeur.</h1>
          <p>
            AgroConnect combine le backend Django (JWT, rôles, stock, checkout) et un frontend React pour offrir un
            flux e-commerce complet.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/shop">
              Voir la boutique
            </Link>
            <Link className="button" to="/register">
              Créer un compte
            </Link>
          </div>
        </div>
        <Card title="Ce que vous obtenez">
          <ul>
            <li>Catalogue produits avec stock.</li>
            <li>Panier client + checkout.</li>
            <li>Suivi commandes par utilisateur.</li>
            <li>Espace prestataire pour gérer ses produits.</li>
          </ul>
        </Card>
      </section>

      <section className="info-grid">
        <Card title="Client">
          <p>Achetez depuis la boutique, gérez votre panier et suivez vos commandes.</p>
        </Card>
        <Card title="Prestataire">
          <p>Créez vos catégories et produits, puis pilotez votre catalogue.</p>
        </Card>
        <Card title="Admin">
          <p>Supervisez l&apos;activité, les comptes et les transactions.</p>
        </Card>
      </section>
    </div>
  )
}

export default Home
