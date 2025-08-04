import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/utils/api';
import { strings } from '@/utils/strings';
import { SettingsSkeleton } from '@/components/common/SkeletonLoader';
import { LoadingButton } from '@/components/common/LoadingButton';
import { Modal } from '@/components/ui/Modal';
import { PersianInput } from '@/components/ui/PersianInput';
import { PersianButton } from '@/components/ui/PersianButton';
import toast from 'react-hot-toast';
import { KeyIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('رمز عبور فعلی الزامی است'),
  newPassword: yup.string()
    .min(6, 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
    .required('رمز عبور جدید الزامی است'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'تأیید رمز عبور مطابقت ندارد')
    .required('تأیید رمز عبور الزامی است')
}).required();

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const Settings: React.FC = () => {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema)
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    setLoading(true);
    
    try {
      const result = await authApi.changePassword(data.currentPassword, data.newPassword);
      
      if (result.success) {
        toast.success(strings.passwordChanged);
        reset();
      } else {
        toast.error(result.error || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    setGeneratingKey(true);
    
    try {
      const result = await authApi.regenerateApiKey();
      
      if (result.success && result.data) {
        setNewApiKey(result.data.apiKey);
        setIsApiKeyModalOpen(true);
        toast.success('کلید API جدید تولید شد');
      } else {
        toast.error(result.error || 'خطا در تولید کلید API');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      toast.success('کلید کپی شد');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('خطا در کپی کردن');
    }
  };

  const closeApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
    setNewApiKey('');
    setCopied(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground font-vazir">
          {strings.settings}
        </h1>
        <p className="text-sm text-muted-foreground font-vazir mt-1">
          مدیریت تنظیمات حساب کاربری
        </p>
      </div>

      <div className="space-y-8">
        {/* Change Password Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <KeyIcon className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-vazir">
              {strings.changePassword}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
            <PersianInput
              label={strings.currentPassword}
              type="password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
              placeholder="رمز عبور فعلی خود را وارد کنید"
            />

            <PersianInput
              label={strings.newPassword}
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              placeholder="رمز عبور جدید را وارد کنید"
            />

            <PersianInput
              label={strings.confirmPassword}
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="رمز عبور جدید را تأیید کنید"
            />

            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full sm:w-auto"
            >
              {strings.save}
            </LoadingButton>
          </form>
        </div>

        {/* API Key Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <ClipboardDocumentIcon className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground font-vazir">
                  کلید API
                </h2>
                <p className="text-sm text-muted-foreground font-vazir">
                  برای دسترسی به API از این کلید استفاده کنید
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground font-vazir mb-2">
                کلید فعلی:
              </p>
              <code className="text-sm font-mono bg-background border border-border rounded px-2 py-1 numbers-ltr">
                ****-****-****-****
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <LoadingButton
                onClick={handleRegenerateApiKey}
                loading={generatingKey}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {strings.regenerateApiKey}
              </LoadingButton>
              
              <div className="text-sm text-muted-foreground font-vazir">
                <p>⚠️ تولید کلید جدید، کلید قبلی را غیرفعال می‌کند</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground font-vazir mb-4">
            اطلاعات کاربر
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground font-vazir">
                ایمیل:
              </span>
              <span className="text-sm text-foreground font-vazir numbers-ltr">
                {state.user?.email || 'نامشخص'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground font-vazir">
                نام:
              </span>
              <span className="text-sm text-foreground font-vazir">
                {state.user?.name || 'نامشخص'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground font-vazir">
                وضعیت:
              </span>
              <span className="text-sm text-green-600 font-vazir">
                فعال
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <Modal
        isOpen={isApiKeyModalOpen}
        onClose={closeApiKeyModal}
        title="کلید API جدید"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-vazir">
              ⚠️ این کلید فقط یک بار نمایش داده می‌شود. لطفاً آن را در جای امنی ذخیره کنید.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-vazir">
              کلید API جدید:
            </label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                readOnly
                value={newApiKey}
                className="flex-1 p-3 border border-input rounded-md bg-muted text-foreground font-mono text-sm numbers-ltr"
              />
              <PersianButton
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </PersianButton>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-foreground font-vazir mb-2">
              نحوه استفاده:
            </h4>
            <code className="text-sm font-mono bg-background border border-border rounded px-2 py-1 block numbers-ltr">
              Authorization: Bearer {newApiKey}
            </code>
          </div>

          <div className="flex justify-end pt-4">
            <PersianButton onClick={closeApiKeyModal}>
              بستن
            </PersianButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};