import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

interface AboutUsItem {
  id: number;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  aboutUsItems: AboutUsItem[] = [];
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadAboutUsContent();
  }

  async loadAboutUsContent() {
    try {
      this.aboutUsItems = await this.supabaseService.getAboutUs();
    } catch (error) {
      console.error('Error loading about us content:', error);
    } finally {
      this.loading = false;
    }
  }
}
