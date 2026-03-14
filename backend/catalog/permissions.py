from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSellerOrAdminForWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role in {
            "PRESTATAIRE",
            "ADMIN",
        }

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role == "ADMIN":
            return True
        return obj.seller_id == request.user.id
