from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class CatalogApiTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="StrongPass123",
            role="PRESTATAIRE",
            is_active=True,
        )

    def test_seller_can_create_product(self):
        self.client.force_authenticate(user=self.seller)

        category_resp = self.client.post(
            reverse("category-list-create"),
            {"name": "Legumes", "slug": "legumes"},
            format="json",
        )
        self.assertEqual(category_resp.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            reverse("product-list-create"),
            {
                "category": category_resp.data["id"],
                "name": "Tomate",
                "slug": "tomate",
                "description": "Bio",
                "price": "1200.00",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Tomate")
