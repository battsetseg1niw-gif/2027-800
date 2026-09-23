import React, { useState } from "react";
import { Database, Copy, Check, X, Shield, Server, CheckCircle2 } from "lucide-react";
import { SUPABASE_SCHEMA_SQL } from "../lib/supabase";

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Supabase Database Schema & Row Level Security (RLS)
              </h3>
              <p className="text-xs text-slate-700">
                PostgreSQL DDL, Сурагч/Багш/Админ 3 эрхийн RLS бодлого, Vercel тохиргоо
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              RLS бүрэн хангагдсан: 10 хүснэгт, автомат Trigger, Индексүүд
            </span>
          </div>

          <button
            id="btn-copy-schema-sql"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Хуулагдлаа!" : "SQL хуулах"}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-900 p-4 text-emerald-400 font-mono text-xs leading-relaxed">
          <pre>{SUPABASE_SCHEMA_SQL}</pre>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-700">
          <span>Supabase Dashboard → SQL Editor-д шууд хуулж ажиллуулах боломжтой.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
};
