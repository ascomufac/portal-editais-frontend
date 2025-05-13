
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    // Handle dd/mm/yyyy format that's common in Brazilian dates
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Check if it's in dd/mm/yyyy format
      const brazilianDateFormat = /^\d{2}\/\d{2}\/\d{4}$/;
      if (brazilianDateFormat.test(date)) {
        const [day, month, year] = date.split('/').map(part => parseInt(part, 10));
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    // Check if the date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return typeof date === 'string' ? date : '';
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return typeof date === 'string' ? date : '';
  }
}

export function isPdf(filename: string): boolean {
  // Handle undefined or null values
  if (!filename) return false;
  
  return filename.toLowerCase().endsWith('.pdf');
}

export function toggleSidebarCookie(collapsed: boolean) {
  document.cookie = `sidebar-collapsed=${collapsed}; path=/; max-age=31536000`; // 1 year
  // Force a browser reflow to ensure UI updates
  document.body.classList.add('sidebar-state-changed');
  setTimeout(() => {
    document.body.classList.remove('sidebar-state-changed');
  }, 50);
}

export function getSidebarCollapsedState(): boolean {
  const match = document.cookie.match(/(^|;)\s*sidebar-collapsed\s*=\s*([^;]+)/);
  return match ? match[2] === 'true' : false;
}
