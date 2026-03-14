from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product, Stock
from users.models import User


class OrdersApiTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="StrongPass123",
            role="CLIENT",
            is_active=True,
        )
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="StrongPass123",
            role="PRESTATAIRE",
            is_active=True,
        )
        category = Category.objects.create(name="Fruits", slug="fruits")
        self.product = Product.objects.create(
            seller=self.seller,
            category=category,
            name="Pomme",
            slug="pomme",
            description="Rouge",
            price="2500.00",
            is_active=True,
        )
        Stock.objects.create(product=self.product, quantity=10)

    def test_checkout_creates_order_and_decrements_stock(self):
        self.client.force_authenticate(user=self.client_user)

        add_item_response = self.client.post(
            reverse("cart-item-create"),
            {"product": str(self.product.id), "quantity": 2},
            format="json",
        )
        self.assertEqual(add_item_response.status_code, status.HTTP_201_CREATED)

        checkout_response = self.client.post(
            reverse("orders-checkout"),
            {"shipping_address": "Antananarivo"},
            format="json",
        )
        self.assertEqual(checkout_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(checkout_response.data["status"], "PENDING")
        self.assertEqual(checkout_response.data["total_amount"], "5000.00")

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock.quantity, 8)

    def test_checkout_fails_with_empty_cart(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(reverse("orders-checkout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Panier vide", str(response.data))
