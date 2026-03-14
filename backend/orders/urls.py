from django.urls import path

from .views import (
    CartItemCreateView,
    CartItemUpdateDeleteView,
    CartView,
    CheckoutView,
    OrderListView,
)

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartItemCreateView.as_view(), name="cart-item-create"),
    path("cart/items/<uuid:pk>/", CartItemUpdateDeleteView.as_view(), name="cart-item-update-delete"),
    path("orders/checkout/", CheckoutView.as_view(), name="orders-checkout"),
    path("orders/", OrderListView.as_view(), name="orders-list"),
]
