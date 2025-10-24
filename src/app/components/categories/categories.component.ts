import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories',
  standalone: true,
    imports: [CommonModule, FormsModule],

  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  newName = '';
  // Track which category rows are expanded
  private expandedCategoryIds = new Set<number | string>();
  constructor(private sb: SupabaseService) {}
  async ngOnInit() { await this.loadAll(); }

  async addSubcategory(categoryId: number | string, name: string) {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    // Optimistic UI: push temp item
    const cat = this.categories.find(c => c.id === categoryId);
    const tempId = `temp-${Date.now()}`;
    const tempSub = { id: tempId, name: trimmed, category_id: categoryId } as any;
    if (cat) {
      cat.subcategories = cat.subcategories || [];
      cat.subcategories.unshift(tempSub);
    }
    try {
      const created = await this.sb.createSubcategory(trimmed, categoryId);
      // Replace temp with real
      if (cat) {
        const idx = cat.subcategories.findIndex((s:any) => s.id === tempId);
        if (idx !== -1) cat.subcategories[idx] = created;
      }
      void Swal.fire({ icon: 'success', title: 'Added', text: 'Subcategory added', timer: 1200, showConfirmButton: false, position: 'top-end' });
    } catch (e:any) {
      // Rollback
      if (cat) cat.subcategories = (cat.subcategories||[]).filter((s:any) => s.id !== tempId);
      await Swal.fire({ icon: 'error', title: 'Error', text: (e.message||e) });
    }
  }

  async deleteSubcategory(id: number | string) {
    const r = await Swal.fire({ title: 'Delete subcategory?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' });
    if (!r.isConfirmed) return;
    // Optimistic UI: remove immediately
    const { catRef, removed } = this.removeSubOptimistic(id);
    try {
      await this.sb.deleteSubcategory(id);
      void Swal.fire({ icon: 'success', title: 'Deleted', text: 'Subcategory deleted', timer: 1200, showConfirmButton: false, position: 'top-end' });
    } catch (e:any) {
      // Rollback on error
      if (catRef && removed) {
        catRef.subcategories.splice(removed.index, 0, removed.item);
      }
      await Swal.fire({ icon: 'error', title: 'Error', text: (e.message||e) });
    }
  }

  // reload categories and attach subcategories
  private async loadAll() {
    this.categories = await this.sb.getCategories();
    const subs = await this.sb.getSubcategories();
    // attach subcategories to their parent category
    this.categories.forEach(c => c.subcategories = subs.filter((s:any) => s.category_id === c.id));
  }

  // UI helpers: expand/collapse per category
  isExpanded(categoryId: number | string): boolean {
    return this.expandedCategoryIds.has(categoryId);
  }

  toggleExpand(categoryId: number | string): void {
    if (this.expandedCategoryIds.has(categoryId)) {
      this.expandedCategoryIds.delete(categoryId);
    } else {
      this.expandedCategoryIds.add(categoryId);
    }
  }

  async addCategory() {
    if (!this.newName || !this.newName.trim()) return;
    const trimmed = this.newName.trim();
    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const tempCat: any = { id: tempId, name: trimmed, subcategories: [] };
    this.categories.unshift(tempCat);
    this.newName = '';
    try {
      const created = await this.sb.createCategory(trimmed);
      const idx = this.categories.findIndex(c => c.id === tempId);
      if (idx !== -1) this.categories[idx] = { ...created, subcategories: [] };
      void Swal.fire({ icon: 'success', title: 'Added', text: 'Category added', timer: 1200, showConfirmButton: false, position: 'top-end' });
    } catch (e:any) {
      this.categories = this.categories.filter(c => c.id !== tempId);
      await Swal.fire({ icon: 'error', title: 'Error', text: (e.message||e) });
    }
  }

  async deleteCategory(id: number | string) {
    const r = await Swal.fire({ title: 'Delete category?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' });
    if (!r.isConfirmed) return;
    // Optimistic removal
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) return;
    const removed = this.categories[idx];
    this.categories.splice(idx, 1);
    try {
      await this.sb.deleteCategory(id);
      void Swal.fire({ icon: 'success', title: 'Deleted', text: 'Category deleted', timer: 1200, showConfirmButton: false, position: 'top-end' });
    } catch (e:any) {
      // rollback
      this.categories.splice(idx, 0, removed);
      await Swal.fire({ icon: 'error', title: 'Error', text: (e.message||e) });
    }
  }

  // Helper for optimistic subcategory delete
  private removeSubOptimistic(id: number | string): { catRef: any | null, removed: { index: number, item: any } | null } {
    for (const c of this.categories) {
      const list = c.subcategories || [];
      const i = list.findIndex((s:any) => s.id === id);
      if (i !== -1) {
        const item = list[i];
        list.splice(i, 1);
        return { catRef: c, removed: { index: i, item } };
      }
    }
    return { catRef: null, removed: null };
  }
}
