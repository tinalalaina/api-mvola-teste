from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


@override_settings(MEDIA_ROOT="/tmp/test-media")
class CatalogApiTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="StrongPass123",
            role="PRESTATAIRE",
            is_active=True,
        )
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="StrongPass123",
            role="CLIENT",
            is_active=True,
        )

    def _fake_image(self, name="image.png"):
        file_obj = BytesIO()
        image = Image.new("RGB", (50, 50), "blue")
        image.save(file_obj, "PNG")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/png")

    def test_seller_can_create_product_with_stock(self):
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
                "stock_quantity": 17,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Tomate")
        self.assertEqual(response.data["stock"]["quantity"], 17)

    def test_client_cannot_create_category(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(
            reverse("category-list-create"),
            {"name": "Interdit", "slug": "interdit"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_seller_can_upload_up_to_five_images(self):
        self.client.force_authenticate(user=self.seller)
        product_resp = self.client.post(
            reverse("product-list-create"),
            {
                "name": "Carotte",
                "slug": "carotte",
                "description": "Orange",
                "price": "1000.00",
                "is_active": True,
                "stock_quantity": 9,
            },
            format="json",
        )
        self.assertEqual(product_resp.status_code, status.HTTP_201_CREATED)
        product_id = product_resp.data["id"]

        files = [self._fake_image(f"p{i}.png") for i in range(1, 6)]
        upload_resp = self.client.post(
            reverse("product-images-upload", kwargs={"pk": product_id}),
            {"images": files},
            format="multipart",
        )
        self.assertEqual(upload_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(upload_resp.data["total_images"], 5)

        extra_resp = self.client.post(
            reverse("product-images-upload", kwargs={"pk": product_id}),
            {"images": [self._fake_image("extra.png")]},
            format="multipart",
        )
        self.assertEqual(extra_resp.status_code, status.HTTP_400_BAD_REQUEST)
