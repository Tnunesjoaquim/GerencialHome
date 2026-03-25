-- Atualizar RLS da tabela inventory_categories para restringir o DELETE ao Admin
DROP POLICY IF EXISTS "Users can delete inventory categories for their residences" ON public.inventory_categories;
CREATE POLICY "Users can delete inventory categories for their residences"
ON public.inventory_categories FOR DELETE
USING (
  public.user_is_residence_admin(residence_id)
);

-- Atualizar RLS da tabela inventory_items para restringir o DELETE ao Admin
DROP POLICY IF EXISTS "Users can delete inventory items for their residences" ON public.inventory_items;
CREATE POLICY "Users can delete inventory items for their residences"
ON public.inventory_items FOR DELETE
USING (
  public.user_is_residence_admin((
    SELECT residence_id FROM public.inventory_categories
    WHERE id = inventory_items.category_id
  ))
);
