# Analyse du backend actuel et plan pour créer un site de vente

## 1) Ce que le code actuel fait déjà bien

- Authentification JWT (login, refresh, logout) avec utilisateur personnalisé.
- Gestion de plusieurs rôles (`CLIENT`, `PRESTATAIRE`, `ADMIN`, `SUPPORT`).
- Profil enrichi (coordonnées, adresse, date de naissance, photo de profil, CIN recto/verso).
- API déjà documentée avec Swagger (`/swagger/`).
- Upload de médias déjà opérationnel.

➡️ Conclusion: la base “gestion utilisateurs + sécurité d’accès API” existe déjà, ce qui est un excellent point de départ pour un site e-commerce multi-utilisateur.

---

## 2) Ce qu’il manque pour un vrai site de vente

Pour passer d’un backend “utilisateurs” à un “site de vente”, il faut ajouter des domaines métiers:

1. **Catalogue**
   - Catégories
   - Produits
   - Variantes (taille/couleur) si besoin
   - Images produits

2. **Stock**
   - Quantité disponible
   - Réservations de stock lors d’une commande

3. **Panier**
   - Panier par client
   - Lignes panier (produit, quantité, prix capturé)

4. **Commande**
   - Validation panier → commande
   - Statuts: `PENDING`, `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

5. **Paiement**
   - Intégration mobile money / carte / virement
   - Webhook de confirmation

6. **Livraison**
   - Adresse livraison
   - Méthode livraison
   - Frais livraison

7. **Back-office vendeur/admin**
   - Gestion produits
   - Suivi commandes
   - Gestion remboursements / litiges

---

## 3) Proposition d’architecture (adaptée à votre projet Django actuel)

Créer de nouvelles apps Django:

- `catalog` : produits, catégories, images, variantes
- `orders` : panier, commandes, lignes de commande
- `payments` : transactions et webhooks
- `shipping` : options de livraison et suivi

Conserver l’app `users` actuelle comme socle d’identité.

### Gestion des rôles recommandée

- **CLIENT** : consulter produits, gérer panier, passer commande.
- **PRESTATAIRE** (vendeur) : créer/éditer ses produits, voir ses commandes.
- **ADMIN** : supervision globale.
- **SUPPORT** : accès service client (lecture + actions limitées).

---

## 4) Schéma de données minimal à implémenter

### `catalog/models.py`
- `Category(id, name, slug, parent)`
- `Product(id, seller(FK User), category, name, slug, description, price, is_active, created_at)`
- `ProductImage(id, product(FK), image, is_cover)`
- `Stock(product(FK), quantity, updated_at)`

### `orders/models.py`
- `Cart(id, user(FK), created_at)`
- `CartItem(id, cart(FK), product(FK), quantity, unit_price)`
- `Order(id, user(FK), total_amount, status, shipping_address, created_at)`
- `OrderItem(id, order(FK), product(FK), quantity, unit_price)`

### `payments/models.py`
- `Payment(id, order(FK), provider, reference, amount, status, payload_json, created_at)`

---

## 5) Plan d’implémentation par étapes (concret)

### Étape 1 — Fondations produit
- Créer app `catalog`
- CRUD produits + catégories
- Permissions:
  - `PRESTATAIRE` crée/édite seulement ses produits
  - `ADMIN` accès global

### Étape 2 — Panier et commande
- Créer app `orders`
- Endpoints:
  - `POST /api/cart/items/`
  - `PATCH /api/cart/items/{id}/`
  - `DELETE /api/cart/items/{id}/`
  - `POST /api/orders/checkout/`

### Étape 3 — Paiement
- Créer app `payments`
- Initier transaction au checkout
- Endpoint webhook sécurisé (signature provider)
- Mettre à jour commande → `PAID`

### Étape 4 — Livraison
- Ajouter règles de frais livraison
- Ajouter suivi de statut commande

### Étape 5 — Front-end e-commerce
- Choix conseillé: **Next.js** ou **React + Vite**
- Pages clés:
  - Catalogue
  - Détail produit
  - Panier
  - Checkout
  - Mes commandes
  - Espace vendeur

---

## 6) Sécurité et qualité (à ne pas ignorer)

- Restreindre permissions par rôle côté API (DRF permissions custom).
- Empêcher qu’un vendeur modifie les produits d’un autre.
- Vérifier le stock avant validation commande.
- Enregistrer le prix au moment de la commande (ne pas relire le prix produit ensuite).
- Gérer l’idempotence des webhooks paiement.
- Ajouter des tests API (auth, permissions, checkout, paiement).

---

## 7) Priorité MVP (version rapide à livrer)

1. Auth existante ✅
2. Catalogue (lecture publique + gestion vendeur)
3. Panier
4. Checkout simple
5. Paiement (1 provider)
6. Historique commandes client

En suivant cet ordre, vous obtenez une première version vendable rapidement, puis vous ajoutez les raffinements (promotions, coupons, notation, chat vendeur-client).
