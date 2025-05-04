import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryTransactionService } from '../../../../service/inventory-transaction.service';
import { ApiResponse } from '../../../../reponses/api.response';
import { UpdateTransactionDTO } from '../../../../dtos/inventory/update-transaction.dto';

@Component({
  selector: 'app-update.inventory-transaction.admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update.inventory-transaction.admin.component.html',
  styleUrls: ['./update.inventory-transaction.admin.component.scss']
})
export class UpdateInventoryTransactionAdminComponent implements OnInit {
  transactionForm: FormGroup;
  transactionId!: number;
  transactionTypes = ['IMPORT', 'EXPORT', 'ADJUSTMENT', 'TRANSFER'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: InventoryTransactionService
  ) {
    this.transactionForm = this.fb.group({
      quantityChange: ['', [Validators.required, Validators.min(1)]],
      note: [''],
      transactionType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.transactionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTransaction();
  }

  loadTransaction() {
    this.transactionService.getTransactionById(this.transactionId).subscribe({
      next: (response: ApiResponse) => {
        const transaction = response.data;
        this.transactionForm.patchValue({
          quantityChange: transaction.quantityChange,
          note: transaction.note,
          transactionType: transaction.transactionType
        });
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
      }
    });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const updateData = new UpdateTransactionDTO({
        quantityChange: this.transactionForm.value.quantityChange,
        note: this.transactionForm.value.note,
        transactionType: this.transactionForm.value.transactionType
      });

      this.transactionService.updateTransaction(this.transactionId, updateData).subscribe({
        next: () => {
          alert('Transaction updated successfully');
          this.router.navigate(['/admin/transactions']);
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          alert('Failed to update transaction');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/transactions']);
  }
}