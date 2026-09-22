'use client';

/**
 * login/page.tsx
 * Página de login do ERP GYM.
 *
 * Visual:
 * - Fundo com blobs animados (efeito fluido/água)
 * - Card com glassmorphism centralizado
 * - Input com ícones e toggle de senha
 * - Botão com gradiente e efeito ripple
 * - Animação de entrada (fade-in-up)
 *
 * Funcionalidades:
 * - Validação com react-hook-form + zod
 * - Feedback de erro da API
 * - Redireciona para /dashboard após login
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Dumbbell, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Schema de validação do formulário de login
const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Tipo inferido do schema — usado no react-hook-form
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();

  // Estado de loading durante a requisição de login
  const [isLoading, setIsLoading]       = useState(false);

  // Mensagem de erro retornada pela API
  const [error, setError]               = useState('');

  // Controla visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Configura o formulário com validação via zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * onSubmit
   * Chamado após validação bem-sucedida do formulário.
   * Chama o login do contexto e trata erros da API.
   */
  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
    } catch {
      setError('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Blobs animados de fundo ──────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Blob azul — canto superior esquerdo */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:  'radial-gradient(circle, #3b82f6, transparent)',
            top:         '-200px',
            left:        '-200px',
            filter:      'blur(60px)',
            animation:   'blob-float 12s ease-in-out infinite',
          }}
        />
        {/* Blob roxo — canto inferior direito */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-8"
          style={{
            background:     'radial-gradient(circle, #8b5cf6, transparent)',
            bottom:         '-150px',
            right:          '-150px',
            filter:         'blur(60px)',
            animation:      'blob-float 10s ease-in-out infinite reverse',
            animationDelay: '-4s',
          }}
        />
        {/* Blob ciano — centro */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-6"
          style={{
            background:     'radial-gradient(circle, #06b6d4, transparent)',
            top:            '50%',
            left:           '50%',
            transform:      'translate(-50%, -50%)',
            filter:         'blur(60px)',
            animation:      'blob-float 14s ease-in-out infinite',
            animationDelay: '-7s',
          }}
        />
      </div>

      {/* ── Conteúdo principal ───────────────────────────── */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative">
              {/* Ícone com gradiente e glow */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl glow-blue shadow-2xl">
                <Dumbbell className="w-9 h-9 text-white" />
              </div>
              {/* Pulso animado ao redor do ícone */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl animate-glow-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            ERP <span className="text-gradient">GYM</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Faça login para continuar</p>
        </div>

        {/* ── Card glassmorphism ───────────────────────────── */}
        <div className="modal-content rounded-2xl p-8">

          {/* Linha de brilho no topo do card */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mb-8 -mx-8 px-8" />

          {/* Mensagem de erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Campo Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="input-glass w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-glass w-full rounded-xl pl-10 pr-12 py-3 text-sm"
                />
                {/* Toggle de visibilidade da senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary ripple-btn w-full text-white font-semibold rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no sistema'
              )}
            </button>
          </form>

          {/* Divisor com gradiente */}
          <hr className="divider-gradient my-6" />


        </div>

        {/* Rodapé */}
        <p className="text-center text-gray-600 text-xs mt-6">
          ERP GYM v1.0 — BEN TECH
        </p>
      </div>
    </div>
  );
}
