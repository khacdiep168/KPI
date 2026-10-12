-- Migration: Security Hardening & RPC Authentication
-- Description: Khóa bảo mật dữ liệu nhạy cảm, ngăn ngừa lộ mật khẩu và cấm xóa đánh giá trái phép

-- 1. Hàm xác thực thông tin đăng nhập bảo mật (SECURITY DEFINER)
-- Chỉ trả về thông tin hồ sơ nhân viên, KHÔNG BAO GIỜ trả về password
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

-- 2. Hàm đổi mật khẩu bảo mật (kiểm tra mật khẩu cũ phía server)
CREATE OR REPLACE FUNCTION public.change_user_password(
  p_manv text,
  p_old_pass text,
  p_new_pass text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pass text;
BEGIN
  SELECT password INTO v_pass
  FROM public.users
  WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_manv));

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF TRIM(COALESCE(v_pass, '')) = TRIM(p_old_pass) THEN
    UPDATE public.users
    SET password = TRIM(p_new_pass)
    WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_manv));
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- 3. Hàm reset mật khẩu về mặc định '123'
CREATE OR REPLACE FUNCTION public.admin_reset_password(
  p_target_manv text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET password = '123'
  WHERE UPPER(TRIM(manv)) = UPPER(TRIM(p_target_manv));

  RETURN FOUND;
END;
$$;

-- 4. Cấp quyền thực thi các hàm RPC cho anon, authenticated, service_role
GRANT EXECUTE ON FUNCTION public.verify_user_credentials(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.change_user_password(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reset_password(text) TO anon, authenticated, service_role;

-- 5. Thu hồi quyền xóa bảng evaluations từ public/anon
DROP POLICY IF EXISTS "Allow public delete evaluations" ON public.evaluations;

-- 6. Thu hồi quyền SELECT cột password và quyền UPDATE cột role, password từ anon
REVOKE SELECT (password) ON public.users FROM anon;
REVOKE UPDATE (role, password) ON public.users FROM anon;
