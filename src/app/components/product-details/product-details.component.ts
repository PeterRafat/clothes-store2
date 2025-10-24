import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  loading = true;
  
  constructor(private route: ActivatedRoute, private sb: SupabaseService) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) return;
      this.product = await this.sb.getProductById(id);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      this.loading = false;
    }
  }

  openWhatsApp() {
    if (!this.product) return;
    const phone = '201002274997'; 
    // Build a readable message and include the image URL so WhatsApp can show a link preview
    const parts = [];
    parts.push('طلب منتج');
    parts.push(`اسم: ${this.product.name}`);
    parts.push(`السعر: ${String(this.product.price)} EGP`);
    if (this.product.color) parts.push(`اللون: ${this.product.color}`);
    if (this.product.sizes && this.product.sizes.length) parts.push(`المقاسات: ${(this.product.sizes||[]).join(', ')}`);
    if (this.product.image_url) parts.push(`صورة: ${this.product.image_url}`);
    const text = encodeURIComponent(parts.join('\n'));
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  }
}
