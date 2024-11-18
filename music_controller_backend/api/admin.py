from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import CustomUser


# 自定义用户管理器显示
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'password', 'email', 'description']  # 定义列表页显示的字段
    search_fields = ['username', 'email']  # 定义搜索字段
    list_filter = ['is_active', 'is_staff']  # 定义过滤器


admin.site.register(CustomUser, CustomUserAdmin)
