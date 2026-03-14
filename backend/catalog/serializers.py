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
    stock_quantity = serializers.IntegerField(write_only=True, required=False, min_value=0)

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
            "stock_quantity",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        request = self.context["request"]
        stock_quantity = validated_data.pop("stock_quantity", 0)
        validated_data["seller"] = request.user
        product = super().create(validated_data)
        Stock.objects.create(product=product, quantity=stock_quantity)
        return product

    def update(self, instance, validated_data):
        stock_quantity = validated_data.pop("stock_quantity", None)
        product = super().update(instance, validated_data)
        if stock_quantity is not None:
            stock, _ = Stock.objects.get_or_create(product=product)
            stock.quantity = stock_quantity
            stock.save(update_fields=["quantity", "updated_at"])
        return product


class ProductImageUploadSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False,
        write_only=True,
        min_length=1,
    )

    def validate_images(self, images):
        product = self.context["product"]
        if product.images.count() + len(images) > 5:
            raise serializers.ValidationError("Maximum 5 photos par produit.")
        return images

    def save(self, **kwargs):
        product = self.context["product"]
        created = []
        for image in self.validated_data["images"]:
            created.append(ProductImage.objects.create(product=product, image=image))
        return created
