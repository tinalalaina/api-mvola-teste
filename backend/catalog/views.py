from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product
from .permissions import IsSellerOrAdminForWrite
from .serializers import CategorySerializer, ProductSerializer, ProductImageUploadSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSellerOrAdminForWrite()]
        return [permissions.AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsSellerOrAdminForWrite()]


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


class ProductImageUploadView(APIView):
    permission_classes = [IsSellerOrAdminForWrite]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        self.check_object_permissions(request, product)

        serializer = ProductImageUploadSerializer(
            data={"images": request.FILES.getlist("images")},
            context={"product": product},
        )
        serializer.is_valid(raise_exception=True)
        created = serializer.save()

        return Response(
            {
                "message": "Photos ajoutées.",
                "created_count": len(created),
                "total_images": product.images.count(),
            },
            status=status.HTTP_201_CREATED,
        )
