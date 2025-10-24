import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import Swal from 'sweetalert2';

interface PaymentPolicyItem {
  id?: number;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

@Component({
  selector: 'app-admin-payment-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payment-policy.component.html',
  styleUrls: ['./admin-payment-policy.component.css']
})
export class AdminPaymentPolicyComponent implements OnInit {
  paymentPolicyItems: PaymentPolicyItem[] = [];
  loading = false;
  editingItem: PaymentPolicyItem | null = null;
  showAddForm = false;
  
  newItem: PaymentPolicyItem = {
    paragraph1: '',
    paragraph2: '',
    paragraph3: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadPaymentPolicyItems();
  }

  async loadPaymentPolicyItems() {
    this.loading = true;
    try {
      this.paymentPolicyItems = await this.supabaseService.getPaymentPolicy();
    } catch (error) {
      console.error('Error loading payment policy items:', error);
      alert('Error loading payment policy items');
    } finally {
      this.loading = false;
    }
  }

  startEdit(item: PaymentPolicyItem) {
    this.editingItem = { ...item };
    this.showAddForm = false;
  }

  cancelEdit() {
    this.editingItem = null;
  }

  async saveEdit() {
    if (!this.editingItem?.id) return;
    
    this.loading = true;
    try {
      await this.supabaseService.updatePaymentPolicy(this.editingItem.id, {
        paragraph1: this.editingItem.paragraph1,
        paragraph2: this.editingItem.paragraph2,
        paragraph3: this.editingItem.paragraph3
      });
      
      await this.loadPaymentPolicyItems();
      this.editingItem = null;
      Swal.fire({
        title: 'تم التحديث!',
        text: 'تم تحديث المحتوى بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      });
    } catch (error) {
      console.error('Error updating payment policy item:', error);
      alert('Error updating payment policy item');
    } finally {
      this.loading = false;
    }
  }

  async deleteItem(id: number) {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;
    
    this.loading = true;
    try {
      await this.supabaseService.deletePaymentPolicy(id);
      await this.loadPaymentPolicyItems();
      Swal.fire({
        title: 'تم الحذف!',
        text: 'تم حذف المحتوى بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      });
    } catch (error) {
      console.error('Error deleting payment policy item:', error);
      alert('Error deleting payment policy item');
    } finally {
      this.loading = false;
    }
  }

  showAddFormToggle() {
    this.showAddForm = !this.showAddForm;
    this.editingItem = null;
    this.newItem = {
      paragraph1: '',
      paragraph2: '',
      paragraph3: ''
    };
  }

  async addNewItem() {
    if (!this.newItem.paragraph1.trim() || !this.newItem.paragraph2.trim() || !this.newItem.paragraph3.trim()) {
      alert('Please fill in all paragraphs');
      return;
    }

    this.loading = true;
    try {
      await this.supabaseService.createPaymentPolicy(this.newItem);
      await this.loadPaymentPolicyItems();
      this.showAddForm = false;
      this.newItem = {
        paragraph1: '',
        paragraph2: '',
        paragraph3: ''
      };
      Swal.fire({
        title: 'تم الإضافة!',
        text: 'تم إضافة المحتوى بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      });
    } catch (error) {
      console.error('Error adding payment policy item:', error);
      alert('Error adding payment policy item');
    } finally {
      this.loading = false;
    }
  }

  insertBold(textareaId: string) {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        // Wrap selected text with <strong> tags
        const boldText = `<strong>${selectedText}</strong>`;
        const newValue = textarea.value.substring(0, start) + boldText + textarea.value.substring(end);
        textarea.value = newValue;
        
        // Update the model
        if (textareaId.includes('newParagraph1')) {
          this.newItem.paragraph1 = textarea.value;
        } else if (textareaId.includes('newParagraph2')) {
          this.newItem.paragraph2 = textarea.value;
        } else if (textareaId.includes('newParagraph3')) {
          this.newItem.paragraph3 = textarea.value;
        } else if (textareaId.includes('editParagraph1')) {
          this.editingItem!.paragraph1 = textarea.value;
        } else if (textareaId.includes('editParagraph2')) {
          this.editingItem!.paragraph2 = textarea.value;
        } else if (textareaId.includes('editParagraph3')) {
          this.editingItem!.paragraph3 = textarea.value;
        }
        
        // Set cursor position after the inserted text
        textarea.focus();
        textarea.setSelectionRange(start + 8, end + 8);
      } else {
        // If no text selected, insert bold placeholder
        const boldPlaceholder = '<strong>Bold Text</strong>';
        const newValue = textarea.value.substring(0, start) + boldPlaceholder + textarea.value.substring(end);
        textarea.value = newValue;
        
        // Update the model
        if (textareaId.includes('newParagraph1')) {
          this.newItem.paragraph1 = textarea.value;
        } else if (textareaId.includes('newParagraph2')) {
          this.newItem.paragraph2 = textarea.value;
        } else if (textareaId.includes('newParagraph3')) {
          this.newItem.paragraph3 = textarea.value;
        } else if (textareaId.includes('editParagraph1')) {
          this.editingItem!.paragraph1 = textarea.value;
        } else if (textareaId.includes('editParagraph2')) {
          this.editingItem!.paragraph2 = textarea.value;
        } else if (textareaId.includes('editParagraph3')) {
          this.editingItem!.paragraph3 = textarea.value;
        }
        
        // Set cursor position to select the placeholder text
        textarea.focus();
        textarea.setSelectionRange(start + 8, start + 17);
      }
    }
  }
}