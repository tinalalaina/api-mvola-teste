from rest_framework import generics, permissions

from .models import Category, Product
from .permissions import IsSellerOrAdminForWrite
from .serializers import CategorySerializer, ProductSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrAdminForWrite]

    def get_queryset(self):
        queryset = Product.objects.select_related("seller", "category", "stock").prefetch_related("images")
        if self.request.query_params.get("seller"):
            queryset = queryset.filter(seller_id=self.request.query_params["seller"])
        if self.request.query_params.get("active") in {"true", "false"}:
            queryset = queryset.filter(is_active=self.request.query_params["active"] == "true")
        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("seller", "category", "stock").prefetch_related("images")
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrAdminForWrite]
