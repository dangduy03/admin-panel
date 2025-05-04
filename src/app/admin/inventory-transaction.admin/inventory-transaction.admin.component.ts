import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../reponses/api.response';
import { InventoryTransaction } from '../../../models/inventory-transaction';
import { InventoryTransactionService } from '../../../service/inventory-transaction.service';
import { TokenService } from '../../../service/token.service';

@Component({
  selector: 'app-inventory-transaction.admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './inventory-transaction.admin.component.html',
  styleUrl: './inventory-transaction.admin.component.scss'
})
export class InventoryTransactionAdminComponent implements OnInit {
  transactions: InventoryTransaction[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];
  filterType: string = 'ALL';
  startDate?: Date;
  endDate?: Date;

  constructor(
    private transactionService: InventoryTransactionService,
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  getTransactions(page: number, limit: number) {
    const type = this.filterType === 'ALL' ? undefined : this.filterType;

    this.transactionService.getTransactions(
      type,
      this.startDate,
      this.endDate,
      page,
      limit
    ).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.transactions = response;
          this.totalPages = 1;
        } else if (response?.data) {
          this.transactions = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        } else {
          this.transactions = [];
          console.error('Unexpected response format:', response);
        }

        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        alert('Error loading data. Please check console for details.');
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  deleteTransaction(transactionId: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== transactionId);
          // Adjust pagination if needed
          if (this.transactions.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.getTransactions(this.currentPage, this.itemsPerPage);
          }
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          alert(`Failed to delete transaction: ${error.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  updateTransaction(transactionId: number) {
    this.router.navigate(['/admin/transactions/update', transactionId]);
  }

  insertTransaction() {
    this.router.navigate(['/admin/transactions/insert']);
  }

  searchTransaction() {
    this.currentPage = 0;
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }
}