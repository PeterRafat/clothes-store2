import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

interface PaymentPolicyItem {
  id: number;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

@Component({
  selector: 'app-payment-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-policy.component.html',
  styleUrls: ['./payment-policy.component.css']
})
export class PaymentPolicyComponent implements OnInit {
  paymentPolicyItems: PaymentPolicyItem[] = [];
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadPaymentPolicyContent();
  }

  async loadPaymentPolicyContent() {
    try {
      this.paymentPolicyItems = await this.supabaseService.getPaymentPolicy();
    } catch (error) {
      console.error('Error loading payment policy content:', error);
    } finally {
      this.loading = false;
    }
  }
}
