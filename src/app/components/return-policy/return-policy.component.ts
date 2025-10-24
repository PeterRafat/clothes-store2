import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

interface ReturnPolicyItem {
  id: number;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

@Component({
  selector: 'app-return-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-policy.component.html',
  styleUrls: ['./return-policy.component.css']
})
export class ReturnPolicyComponent implements OnInit {
  returnPolicyItems: ReturnPolicyItem[] = [];
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadReturnPolicyContent();
  }

  async loadReturnPolicyContent() {
    try {
      this.returnPolicyItems = await this.supabaseService.getReturnPolicy();
    } catch (error) {
      console.error('Error loading return policy content:', error);
    } finally {
      this.loading = false;
    }
  }
}
