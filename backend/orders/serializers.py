from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from catalog.models import Product

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_name", "quantity", "unit_price")
        read_only_fields = ("unit_price",)

    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Ce produit est inactif.")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "created_at", "updated_at", "items")


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    def save(self, **kwargs):
        user = self.context["request"].user
        cart, _ = Cart.objects.get_or_create(user=user)
        items = list(cart.items.select_related("product", "product__stock"))
        if not items:
            raise serializers.ValidationError("Panier vide.")

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                shipping_address=self.validated_data.get("shipping_address", ""),
                status=Order.STATUS_PENDING,
            )
            total = Decimal("0.00")
            for item in items:
                stock = getattr(item.product, "stock", None)
                if stock is None or stock.quantity < item.quantity:
                    raise serializers.ValidationError(
                        f"Stock insuffisant pour le produit: {item.product.name}"
                    )

                stock.quantity -= item.quantity
                stock.save(update_fields=["quantity", "updated_at"])

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
                total += item.unit_price * item.quantity

            order.total_amount = total
            order.save(update_fields=["total_amount"])
            cart.items.all().delete()

        return order


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "quantity", "unit_price")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "total_amount",
            "status",
            "shipping_address",
            "created_at",
            "items",
        )
        read_only_fields = ("user", "total_amount", "status", "created_at")
