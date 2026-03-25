-- Update RLS Policies for Financial Transactions

-- Drop old policies (and new ones to make the script idempotent if run twice)
DROP POLICY IF EXISTS "Users can view their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can insert their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can update their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can delete their own financial transactions" ON public.financial_transactions;

DROP POLICY IF EXISTS "Users can view financial transactions for their residences" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can insert financial transactions for their residences" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can update financial transactions for their residences" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can delete financial transactions for their residences" ON public.financial_transactions;

-- Create new policies using helper function
CREATE POLICY "Users can view financial transactions for their residences"
ON public.financial_transactions FOR SELECT
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can insert financial transactions for their residences"
ON public.financial_transactions FOR INSERT
WITH CHECK (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can update financial transactions for their residences"
ON public.financial_transactions FOR UPDATE
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can delete financial transactions for their residences"
ON public.financial_transactions FOR DELETE
USING (public.user_has_residence_access(residence_id));

-----------------------------------------------------------------------------------
-- Update RLS Policies for Inventory Categories

-- Drop old policies and new ones
DROP POLICY IF EXISTS "Users can view their own inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can insert their own inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can update their own inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can delete their own inventory categories" ON public.inventory_categories;

DROP POLICY IF EXISTS "Users can view inventory categories for their residences" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can insert inventory categories for their residences" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can update inventory categories for their residences" ON public.inventory_categories;
DROP POLICY IF EXISTS "Users can delete inventory categories for their residences" ON public.inventory_categories;

-- Create new policies using helper function
CREATE POLICY "Users can view inventory categories for their residences"
ON public.inventory_categories FOR SELECT
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can insert inventory categories for their residences"
ON public.inventory_categories FOR INSERT
WITH CHECK (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can update inventory categories for their residences"
ON public.inventory_categories FOR UPDATE
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can delete inventory categories for their residences"
ON public.inventory_categories FOR DELETE
USING (public.user_has_residence_access(residence_id));

-----------------------------------------------------------------------------------
-- Update RLS Policies for Inventory Items

-- Drop old policies and new ones
DROP POLICY IF EXISTS "Users can view their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON public.inventory_items;

DROP POLICY IF EXISTS "Users can view inventory items for their residences" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items for their residences" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items for their residences" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items for their residences" ON public.inventory_items;

-- Create new policies mapping through category to residence using helper function
CREATE POLICY "Users can view inventory items for their residences"
ON public.inventory_items FOR SELECT
USING (
    public.user_has_residence_access(
        (SELECT residence_id FROM public.inventory_categories WHERE id = category_id LIMIT 1)
    )
);

CREATE POLICY "Users can insert inventory items for their residences"
ON public.inventory_items FOR INSERT
WITH CHECK (
    public.user_has_residence_access(
        (SELECT residence_id FROM public.inventory_categories WHERE id = category_id LIMIT 1)
    )
);

CREATE POLICY "Users can update inventory items for their residences"
ON public.inventory_items FOR UPDATE
USING (
    public.user_has_residence_access(
        (SELECT residence_id FROM public.inventory_categories WHERE id = category_id LIMIT 1)
    )
);

CREATE POLICY "Users can delete inventory items for their residences"
ON public.inventory_items FOR DELETE
USING (
    public.user_has_residence_access(
        (SELECT residence_id FROM public.inventory_categories WHERE id = category_id LIMIT 1)
    )
);

-----------------------------------------------------------------------------------
-- Update RLS Policies for Calendar Events

-- Drop old policies and new ones
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users can view calendar events for their residences" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert calendar events for their residences" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events for their residences" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events for their residences" ON public.calendar_events;

-- Create new policies using helper function
CREATE POLICY "Users can view calendar events for their residences"
ON public.calendar_events FOR SELECT
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can insert calendar events for their residences"
ON public.calendar_events FOR INSERT
WITH CHECK (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can update calendar events for their residences"
ON public.calendar_events FOR UPDATE
USING (public.user_has_residence_access(residence_id));

CREATE POLICY "Users can delete calendar events for their residences"
ON public.calendar_events FOR DELETE
USING (public.user_has_residence_access(residence_id));
