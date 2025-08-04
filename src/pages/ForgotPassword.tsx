import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PersianButton } from '@/components/ui/PersianButton';
import { PersianInput } from '@/components/ui/PersianInput';
import { authApi } from '@/utils/api';
import { strings } from '@/utils/strings';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(strings.required);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        setSent(true);
        toast.success('ایمیل بازیابی ارسال شد');
      } else {
        toast.error(result.error || 'خطا در ارسال ایمیل');
      }
    } catch (error) {
      toast.error(strings.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-bold text-foreground font-vazir">
              ایمیل ارسال شد
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-vazir">
              لینک بازیابی رمز عبور به ایمیل شما ارسال شد.
            </p>
          </div>
          
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80 font-vazir"
          >
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground font-vazir">
            فراموشی رمز عبور
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-vazir">
            ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <PersianInput
            label={strings.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            className="text-left"
            dir="ltr"
            required
          />

          <PersianButton
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? strings.loading : 'ارسال لینک بازیابی'}
          </PersianButton>
          
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 font-vazir"
            >
              بازگشت به صفحه ورود
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};