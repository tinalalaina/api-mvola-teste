from rest_framework import serializers

from .models import Category, Product, ProductImage, Stock


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_cover", "created_at")


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ("quantity", "updated_at")


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    stock = StockSerializer(read_only=True)
    seller_id = serializers.UUIDField(source="seller.id", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "seller_id",
            "category",
            "name",
            "slug",
            "description",
            "price",
            "is_active",
            "images",
            "stock",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["seller"] = request.user
        product = super().create(validated_data)
        Stock.objects.create(product=product, quantity=0)
        return product
