from django.urls import path

from .views import (
    CategoryDetailView,
    CategoryListCreateView,
    ProductDetailView,
    ProductImageUploadView,
    ProductListCreateView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("products/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<uuid:pk>/images/", ProductImageUploadView.as_view(), name="product-images-upload"),
]
