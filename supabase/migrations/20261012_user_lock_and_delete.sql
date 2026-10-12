-- Migration: User Status Locking & Permanent User Deletion
-- Description: Bổ sung cột status vào public.users, cập nhật RPC verify_user_credentials, 
-- và tạo RPC admin_set_user_status & admin_delete_user chạy với SECURITY DEFINER.

-- 1. Bổ sung cột status vào bảng public.users (nếu chưa có)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE';

-- Cập nhật dữ liệu cũ nếu status đang là NULL
UPDATE public.users 
SET status = 'ACTIVE' 
WHERE status IS NULL;

-- 2. Cấp quyền SELECT, UPDATE, INSERT cột status cho các role
GRANT SELECT (status), UPDATE (status), INSERT (status) ON public.users TO anon, authenticated, service_role;

-- 3. Tạo hàm RPC Khóa/Mở khóa User (admin_set_user_status)
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  p_target_manv text,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET status = UPPER(TRIM(p_status))
  WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_target_manv));

  RETURN FOUND;
END;
$$;

-- 4. Tạo hàm RPC Xóa vĩnh viễn User (admin_delete_user)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_target_manv text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users
  WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_target_manv));

  RETURN FOUND;
END;
$$;

-- 5. Cập nhật RPC verify_user_credentials trả về cột status thực tế
CREATE OR REPLACE FUNCTION public.verify_user_credentials(
  p_manv text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user record;
BEGIN
  SELECT manv, name, dept, title, role, status, password
  INTO v_user
  FROM public.users
  WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_manv));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF TRIM(COALESCE(v_user.password, '')) = TRIM(p_password) THEN
    RETURN jsonb_build_object(
      'manv', v_user.manv,
      'name', v_user.name,
      'dept', v_user.dept,
      'title', v_user.title,
      'role', v_user.role,
      'status', COALESCE(v_user.status, 'ACTIVE')
    );
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- 6. Tạo hàm RPC Thêm/Cập nhật nhân viên bảo mật (admin_upsert_user)
CREATE OR REPLACE FUNCTION public.admin_upsert_user(
  p_manv text,
  p_name text,
  p_dept text,
  p_title text,
  p_role text,
  p_status text DEFAULT 'ACTIVE',
  p_password text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (manv, name, dept, title, role, status, password)
  VALUES (
    UPPER(TRIM(p_manv)),
    TRIM(p_name),
    TRIM(p_dept),
    COALESCE(TRIM(p_title), 'NHÂN VIÊN'),
    COALESCE(TRIM(p_role), 'User'),
    COALESCE(UPPER(TRIM(p_status)), 'ACTIVE'),
    COALESCE(TRIM(p_password), '123')
  )
  ON CONFLICT (manv) DO UPDATE
  SET
    name = EXCLUDED.name,
    dept = EXCLUDED.dept,
    title = EXCLUDED.title,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    password = CASE 
      WHEN p_password IS NOT NULL AND TRIM(p_password) <> '' THEN TRIM(p_password)
      ELSE users.password
    END;

  RETURN true;
END;
$$;

-- 7. Cấp quyền thực thi RPC cho anon, authenticated, service_role
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_user(text, text, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_user_credentials(text, text) TO anon, authenticated, service_role;

