/**
 * page.tsx — Página raiz
 * Redireciona automaticamente para o dashboard.
 * Se não autenticado, o layout do dashboard
 * redireciona para o login.
 */
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
