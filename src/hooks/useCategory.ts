
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import categoryData from '@/data/categoryData';
import { CategoryDataType } from '@/types/edital';

export const useCategory = (): CategoryDataType => {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const [currentCategory, setCurrentCategory] = useState<CategoryDataType>(categoryData['graduacao']);

  useEffect(() => {
    // Extract category from pathname if not available in params
    const pathSegments = location.pathname.split('/');
    const pathCategory = pathSegments[1] || '';

    // Map common route names to category keys
    const routeToCategoryMap: Record<string, keyof typeof categoryData> = {
      'graduacao': 'graduacao',
      'pos-graduacao': 'pos-graduacao',
      'extensao': 'extensao',
      'estudantis': 'estudantis',
      'pessoas': 'pessoas',
      'idiomas': 'idiomas',
      'colegio': 'colegio'
    };

    // Determine the category key to use
    let categoryKey: keyof typeof categoryData;
    
    if (category && category in categoryData) {
      categoryKey = category as keyof typeof categoryData;
    } else if (pathCategory && routeToCategoryMap[pathCategory]) {
      categoryKey = routeToCategoryMap[pathCategory];
    } else {
      categoryKey = 'graduacao'; // Default fallback
    }
    
    setCurrentCategory(categoryData[categoryKey]);
    
    // Scroll to top when category changes
    window.scrollTo(0, 0);
    
    console.log('Category changed to:', categoryKey, categoryData[categoryKey].title);
  }, [category, location.pathname]);

  return currentCategory;
};
