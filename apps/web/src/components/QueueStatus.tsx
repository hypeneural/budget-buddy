import { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    Play,
    RotateCcw,
    Clock,
    CheckCircle2,
    AlertCircle,
    Send,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { queueApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QueueMessage {
    id: number;
    phone: string;
    status: string;
    supplier: string | null;
    quote: string | null;
    created_at: string;
    sent_at: string | null;
    error: string | null;
}

interface QueueStatusData {
    pending: number;
    sent_today: number;
    failed: number;
    recent: QueueMessage[];
}

export function QueueStatus() {
    const [status, setStatus] = useState<QueueStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await queueApi.getStatus();
            setStatus(response.data.data);
        } catch (error) {
            console.error('Failed to fetch queue status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        // Auto-refresh every 20 seconds
        const interval = setInterval(fetchStatus, 20000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleProcess = async () => {
        setProcessing(true);
        try {
            const response = await queueApi.work(10);
            const result = response.data.data;

            if (result.processed > 0) {
                toast.success(`${result.processed} mensagem(ns) processada(s)`);
            } else {
                toast.info('Nenhuma mensagem na fila');
            }

            if (result.errors?.length > 0) {
                toast.warning(`${result.errors.length} erro(s) durante o processamento`);
            }

            await fetchStatus();
        } catch (error) {
            console.error('Failed to process queue:', error);
            toast.error('Erro ao processar fila');
        } finally {
            setProcessing(false);
        }
    };

    const handleRetry = async () => {
        setRetrying(true);
        try {
            const response = await queueApi.retry();
            const result = response.data.data;

            if (result.requeued > 0) {
                toast.success(`${result.requeued} mensagem(ns) reenfileirada(s)`);
                await fetchStatus();
            } else {
                toast.info('Nenhuma mensagem com erro para reenviar');
            }
        } catch (error) {
            console.error('Failed to retry failed messages:', error);
            toast.error('Erro ao reenviar mensagens');
        } finally {
            setRetrying(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl bg-card p-6 shadow-soft-sm">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-card p-6 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Fila de Mensagens
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchStatus}
                    disabled={loading}
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                        <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{status?.pending || 0}</p>
                    <p className="text-xs text-amber-600">Na fila</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{status?.sent_today || 0}</p>
                    <p className="text-xs text-green-600">Enviadas hoje</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <AlertCircle className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{status?.failed || 0}</p>
                    <p className="text-xs text-red-600">Com erro</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    className="flex-1"
                    onClick={handleProcess}
                    disabled={processing || (status?.pending || 0) === 0}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Processar Fila ({status?.pending || 0})
                        </>
                    )}
                </Button>

                {(status?.failed || 0) > 0 && (
                    <Button
                        variant="outline"
                        onClick={handleRetry}
                        disabled={retrying}
                    >
                        {retrying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reenviar ({status?.failed})
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Recent Messages */}
            {status?.recent && status.recent.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Mensagens recentes</h3>
                    <div className="max-h-48 overflow-auto space-y-2">
                        {status.recent.map((msg) => (
                            <div
                                key={msg.id}
                                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">
                                        {msg.supplier || msg.phone}
                                    </p>
                                    {msg.quote && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {msg.quote}
                                        </p>
                                    )}
                                    {msg.error && (
                                        <p className="text-xs text-red-500 truncate">{msg.error}</p>
                                    )}
                                </div>
                                <span className={cn(
                                    'ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                    {
                                        'bg-amber-100 text-amber-700': msg.status === 'queued',
                                        'bg-green-100 text-green-700': msg.status === 'sent',
                                        'bg-red-100 text-red-700': msg.status === 'failed',
                                        'bg-muted text-muted-foreground': msg.status === 'pending',
                                    }
                                )}>
                                    {msg.status === 'queued' && <Clock className="h-3 w-3" />}
                                    {msg.status === 'sent' && <CheckCircle2 className="h-3 w-3" />}
                                    {msg.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                                    {msg.status === 'queued' ? 'Fila' :
                                        msg.status === 'sent' ? 'Enviado' :
                                            msg.status === 'failed' ? 'Erro' : msg.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cron Info */}
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <p>💡 Configure um cron para processar automaticamente:</p>
                <code className="block mt-1 bg-muted px-2 py-1 rounded">
                    */2 * * * * curl -s "SEU_URL/api/v1/queue/cron?token=SEU_TOKEN"
                </code>
            </div>
        </div>
    );
}
