"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Payment {
  id: string;
  amount_usd: number;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  created_at: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  count: number;
}

export function PaymentPanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchPayments();
  }, [period]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?period=${period}`);
      const { data, stats: newStats } = await res.json();
      setPayments(data || []);
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }

  const methodLabels: Record<string, string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    nequi: "Nequi",
    daviplata: "Daviplata",
    card: "Tarjeta",
    waived: "Exento",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-psy-green/15">
            <DollarSign className="h-6 w-6 text-psy-green" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-psy-ink">
              Panel Financiero
            </h2>
            <p className="text-sm text-psy-muted">Registro de ingresos en USD</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-psy-green px-4 py-2 text-sm font-medium text-white transition hover:bg-psy-green/90"
        >
          <Plus size={16} />
          Registrar pago
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total"
          value={`$${stats.total.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Completados"
          value={`$${stats.completed.toFixed(2)}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Pendientes"
          value={`$${stats.pending.toFixed(2)}`}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {["week", "month"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              period === p
                ? "bg-psy-blue text-white"
                : "bg-psy-paper text-psy-muted hover:bg-psy-paper/80"
            }`}
          >
            {p === "week" ? "Esta semana" : "Este mes"}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <NewPaymentForm
          onSuccess={() => {
            setShowForm(false);
            fetchPayments();
          }}
        />
      )}

      {/* Payments List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-psy-muted">Cargando...</p>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border border-psy-border bg-psy-paper/50 p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-psy-muted/30" />
            <p className="mt-2 text-psy-muted">
              Sin pagos registrados en este período
            </p>
          </div>
        ) : (
          payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber";
}) {
  const colors = {
    blue: "bg-psy-blue/10 text-psy-blue",
    green: "bg-psy-green/10 text-psy-green",
    amber: "bg-psy-amber/10 text-psy-amber",
  };

  return (
    <div className="rounded-2xl border border-psy-border bg-white p-6 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-3 text-sm text-psy-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-psy-ink">
        {value}
      </p>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const statusColors: Record<string, string> = {
    pending: "bg-psy-amber/10 text-psy-amber",
    completed: "bg-psy-green/10 text-psy-green",
    failed: "bg-psy-red/10 text-psy-red",
    refunded: "bg-psy-red/10 text-psy-red",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    completed: "Completado",
    failed: "Fallido",
    refunded: "Reembolsado",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-psy-border bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-psy-ink">
          {payment.notes || "Pago de sesión"}
        </p>
        <div className="mt-1 flex items-center gap-3 text-sm text-psy-muted">
          <span>
            {/* @ts-ignore */}
            {methodLabels[payment.payment_method] || payment.payment_method}
          </span>
          <span>•</span>
          <span>
            {format(new Date(payment.created_at), "dd MMM yyyy", {
              locale: es,
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <span className="font-semibold text-psy-ink">
          ${payment.amount_usd.toFixed(2)}
        </span>
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            statusColors[payment.status]
          }`}
        >
          {statusLabels[payment.status]}
        </span>
      </div>
    </div>
  );
}

function NewPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount_usd: "",
    payment_method: "cash" as const,
    notes: "",
    paid_at: new Date().toISOString().split("T")[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount_usd: parseFloat(formData.amount_usd),
          paid_at: formData.paid_at
            ? new Date(formData.paid_at).toISOString()
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar el pago");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-psy-border bg-psy-paper/50 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-psy-ink">
              Monto (USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount_usd}
              onChange={(e) =>
                setFormData({ ...formData, amount_usd: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-psy-border bg-white px-3 py-2 text-psy-ink placeholder-psy-muted focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/10"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-psy-ink">
              Método
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_method: e.target.value as any,
                })
              }
              className="mt-1 w-full rounded-lg border border-psy-border bg-white px-3 py-2 text-psy-ink focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/10"
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="card">Tarjeta</option>
              <option value="waived">Exento</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-psy-ink">
            Fecha del pago
          </label>
          <input
            type="date"
            value={formData.paid_at}
            onChange={(e) =>
              setFormData({ ...formData, paid_at: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-psy-border bg-white px-3 py-2 text-psy-ink focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-psy-ink">
            Notas (opcional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ej: Sesión intensiva, 2 horas"
            className="mt-1 w-full rounded-lg border border-psy-border bg-white px-3 py-2 text-psy-ink placeholder-psy-muted focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/10"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-psy-red/10 p-3 text-sm text-psy-red">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-psy-green px-4 py-2 font-medium text-white transition hover:bg-psy-green/90 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar pago"}
        </button>
      </form>
    </div>
  );
}
