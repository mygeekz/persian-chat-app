import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PersianButton } from '@/components/ui/PersianButton';
import { PersianInput } from '@/components/ui/PersianInput';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/utils/api';
import { strings } from '@/utils/strings';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = strings.required;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = strings.invalidEmail;
    }
    
    if (!formData.password) {
      newErrors.password = strings.required;
    } else if (formData.password.length < 6) {
      newErrors.password = strings.passwordTooShort;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await authApi.login(formData.email, formData.password);
      
      if (result.success && result.data) {
        localStorage.setItem('agent_token', result.data.token);
        dispatch({ type: 'SET_USER', payload: result.data.user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        toast.success(strings.loginSuccess);
        navigate('/chat');
      } else {
        toast.error(result.error || strings.loginError);
      }
    } catch (error) {
      toast.error(strings.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground font-vazir">
            {strings.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-vazir">
            {strings.loginSubtitle}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PersianInput
              label={strings.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@domain.com"
              className="text-left"
              dir="ltr"
              required
            />
            
            <PersianInput
              label={strings.password}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80 font-vazir"
              >
                {strings.forgotPassword}
              </a>
            </div>
          </div>

          <PersianButton
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? strings.loading : strings.login}
          </PersianButton>
        </form>
      </div>
    </div>
  );
};