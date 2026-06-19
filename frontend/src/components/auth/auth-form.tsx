'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  const FieldInput = type === 'password' ? PasswordInput : Input;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <FieldInput
        id={id}
        type={type === 'password' ? undefined : type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
      {message}
    </div>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  loadingText,
  disabled,
  onClick,
  onPointerDown,
  type = 'button',
}: {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  onPointerDown?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <Button
      type={type}
      className="w-full h-11 text-base font-medium shadow-md shadow-primary/15"
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingText ?? 'Please wait...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function useEmailValidation(initial = '') {
  const [email, setEmail] = React.useState(initial);
  const isValid =
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return { email, setEmail, isValid };
}
