import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../service/order.service';
import { ProductService } from '../../../service/product.service';
import { ChartConfiguration, ChartType, } from 'chart.js';
import { CategoryService } from '../../../service/category.service';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';


@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [
        CommonModule,
        NgChartsModule
    ],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
    categoryStats: any[] = [];
    barChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: []
    };
    barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Danh mục'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Số lượng'
                }
            }
        }
    };
    // barChartType: ChartType = 'bar';
    barChartType = 'bar' as const;

    constructor(
        private categoryService: CategoryService,
        private productService: ProductService,
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        this.loadCategoryStatistics();
    }

    loadCategoryStatistics() {
        // Giả sử chúng ta có các API endpoint để lấy thống kê
        this.categoryService.getCategories(0, 100).subscribe(categories => {
            const categoryNames = categories.data.map((c: any) => c.name);
            this.barChartData.labels = categoryNames;

            // Lấy số lượng sản phẩm theo danh mục
            this.productService.getProductCountByCategory().subscribe(productCounts => {
                this.barChartData.datasets.push({
                    data: productCounts,
                    label: 'Sản phẩm',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                });

                // Lấy số lượng đơn hàng theo danh mục
                this.orderService.getOrderCountByCategory().subscribe(orderCounts => {
                    this.barChartData.datasets.push({
                        data: orderCounts,
                        label: 'Đơn hàng',
                        backgroundColor: 'rgba(153, 102, 255, 0.6)'
                    });

                    // Tạo dữ liệu cho bảng thống kê
                    this.categoryStats = categories.data.map((category: any, index: number) => ({
                        id: category.id,
                        name: category.name,
                        productCount: productCounts[index],
                        orderCount: orderCounts[index]
                    }));
                });
            });
        });


    }


    // Dữ liệu doanh thu giả theo tháng (đơn vị: triệu đồng)
    revenueData = {
        labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        datasets: [{
            label: 'Doanh thu (triệu đồng)',
            data: [5, 20, 15, 10, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4
        }]
    };

    // Tùy chọn biểu đồ
    chartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Triệu đồng'
                },
                ticks: {
                    callback: (value) => value + 'tr'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tháng'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `Doanh thu: ${context.raw} triệu đồng`;
                    }
                }
            },
            legend: {
                position: 'top' as const,
            }
        }
    };

    chartType = 'line' as const;

    pieChartData: ChartConfiguration<'pie'>['data'] = {
        labels: ['Áo Vest Nam', 'Áo thun', 'Phụ kiện', 'Quần thun'],
        datasets: [{
            data: [40, 26.67, 20, 13.3],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0'
            ],
            hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0'
            ]
        }]
    };

    // Tùy chọn biểu đồ với kiểu chính xác
    pieChartOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const, // Sử dụng 'as const' để TypeScript hiểu đây là giá trị literal
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        }
    };

    pieChartType = 'pie' as const;
}
