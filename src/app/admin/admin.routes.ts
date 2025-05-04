import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { OrderAdminComponent } from "./order/order.admin.component";
import { ProductAdminComponent } from "./product/product.admin.component";
import { CategoryAdminComponent } from "./category/category.admin.component";
import { DetailOrderAdminComponent } from "./detail-order/detail.order.admin.component";
import { UpdateProductAdminComponent } from "./product/update/update.product.admin.component";
import { InsertProductAdminComponent } from "./product/insert/insert.product.admin.component";
import { UpdateCategoryAdminComponent } from "./category/update/update.category.admin.component";
import { InsertCategoryAdminComponent } from "./category/insert/insert.category.admin.component";
import { UserAdminComponent } from "./user/user.admin.component";
import { CommentAdminComponent } from "./comment-admin/comment-admin.component";
import { StatsComponent } from "./stats/stats.component";
import { WarehouseAdminComponent } from "./warehouse.admin/warehouse.admin.component";
import { InsertWarehouseAdminComponent } from "./warehouse.admin/insert/insert.warehouse.admin.component";
import { UpdateWarehouseAdminComponent } from "./warehouse.admin/update/update.warehouse.admin.component";
import { InventoryTransactionAdminComponent } from "./inventory-transaction.admin/inventory-transaction.admin.component";
import { UpdateInventoryTransactionAdminComponent } from "./inventory-transaction.admin/update/update.inventory-transaction.admin.component";
import { InsertInventoryTransactionAdminComponent } from "./inventory-transaction.admin/insert/insert.inventory-transaction.admin.component";

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            { path: '', redirectTo: 'orders', pathMatch: 'full' },
            {
                path: 'orders', component: OrderAdminComponent
            },
            {
                path: 'products', component: ProductAdminComponent
            },
            {
                path: 'categories', component: CategoryAdminComponent
            },
            {
                path: 'users', component: UserAdminComponent
            },
            //sub path
            {
                path: 'orders/:id', component: DetailOrderAdminComponent
            },
            {
                path: 'products/update/:id', component: UpdateProductAdminComponent
            },
            {
                path: 'products/insert', component: InsertProductAdminComponent
            },
            //categories
            {
                path: 'categories/update/:id', component: UpdateCategoryAdminComponent
            },
            {
                path: 'categories/insert', component: InsertCategoryAdminComponent
            },
            {
                path: 'stats', component: StatsComponent
            },
            {
                path: 'comments', component: CommentAdminComponent
            },
            { path: 'warehouses', component: WarehouseAdminComponent },
            { path: 'warehouses/insert', component: InsertWarehouseAdminComponent },
            { path: 'warehouses/update/:id', component: UpdateWarehouseAdminComponent },

            { path: 'transactions', component: InventoryTransactionAdminComponent },
            { path: 'transactions/insert', component: InsertInventoryTransactionAdminComponent},
            { path: 'transactions/update/:id', component: UpdateInventoryTransactionAdminComponent }
        ]
    }
];

